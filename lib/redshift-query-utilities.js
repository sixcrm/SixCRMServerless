'use strict'
const _ = require('underscore');
const pg = require('pg');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

/*
* Technical Debt: Evaluate the manner by which we instantiate and connect on-demand.  In particular, client pooling is probably a good idea.
* Technical Debt: This utility executes arbitrary queries with little/no query sanitization.
* Technical Debt: Closing the connection to Redshift is blocking.
*/

// process.env.SIX_VERBOSE = 5;

class RedshiftQueryUtilities {

  constructor() {

    this.required_configuration = [
      'user',
      'password',
      'database',
      'port',
      'idle_timeout'
    ];

    this.redshift_configuration = global.SixCRM.configuration.site_config.redshift;

    this.redshift_connection = null;
    this.redshift_is_opened_connection = null;
    this.quiting_timer = null;
    this.quiting_timer_timeout_ms = 10;
    this.awaiting_queries = new Set();
    this.id = Math.random().toFixed(5);
    this.connection_status_change_promise = Promise.resolve();
  }

  instantiateRedshift() {
    if (this.redshift_connection) return Promise.resolve(this.redshift_connection);

    du.debug('Instantiate Redshift');

    let errors = [];

    this.required_configuration.forEach((configuration_parameter) => {

      if (!_.has(this.redshift_configuration, configuration_parameter)) {

        errors.push('Missing Redshift configuration parameter: ' + configuration_parameter);

      }

    });

    if (errors.length > 0) {

      eu.throwError('server', 'Redshift connection errors: ' + errors.join(', '));

    } else {

      return this.getHost().then((host) => {

        if (_.isNull(host)) {

          du.highlight('Set host is ' + host);

          if (_.has(this.redshift_configuration, 'host')) {

            du.warning('Redshift host unset in S3 configuration file...');

            host = this.redshift_configuration.host;

          } else {

            eu.throwError('server', 'Unable to establish Redshift host.');

          }

        } else {

          du.info('Redshift host: ' + host);

        }

        let pg_config = {
          user: this.redshift_configuration.user,
          database: this.redshift_configuration.database,
          password: this.redshift_configuration.password,
          host: host,
          port: this.redshift_configuration.port,
          idleTimeoutMillis: this.redshift_configuration.idle_timeout
        };

        du.highlight('Postgress configuration:', pg_config);

        this.redshift_connection = new pg.Client(pg_config);

        if (objectutilities.getClassName(this.redshift_connection) !== 'Client') {
          //Technical Debt:  The response in local Docker Containers is different then the response in CircleCI docker containers.  Both work...
          //eu.throwError('server', 'Redshift connection returned unexpected results');
        }

        return Promise.resolve(this.redshift_connection);

      });

    }

  }

  scheduleQuit() {
    console.log(this.id, 'scheduling Quit');

    if (this.quiting_timer) {
      clearTimeout(this.quiting_timer);
    }

    this.quiting_timer = setTimeout(() => {

      if (this.awaiting_queries.size) {
        console.log(this.id, 'Awaiting queries:', [...this.awaiting_queries]);
        return Promise.all([...this.awaiting_queries])
          .then(() => this.scheduleQuit());
      }

      this.closeConnection()
        .catch((error) => {
          du.error(error);

          eu.throwError('server', error);

        });
    }, this.quiting_timer_timeout_ms);

    return Promise.resolve();
  }

  query(query, parameters) {

    console.log(this.id, '>>> Init Query Redshift');

    let new_query_promise = new Promise((resolve) => {

      return this.instantiateRedshift()
        .then(() => this.openConnection())
        .then(() => {
          console.log(this.id, '>>>>> Query Redshift');
          return this.queryRaw(query, parameters)
        })
        .then((result) => {

          console.log(this.id, '>>>>>>> Queried Redshift');
          this.scheduleQuit();

          return resolve(this.transformResult(result));

        })
        .catch(error => {

          this.scheduleQuit();

          eu.throwError('server', error);

        })

    });

    let new_awaiting_query = new_query_promise
      .catch(() => true) // Making finally() analogue.
      .then(() => {

        if (!this.awaiting_queries.has(new_awaiting_query)) {

          console.log(this.id, new_awaiting_query.id, '! Query promise not found after query execution!')
          du.error('Query promise not found after query execution!');
          return false;

        }

        console.log(this.id, new_awaiting_query.id, '- Removing awaiting query');
        this.awaiting_queries.delete(new_awaiting_query);
      });

    new_awaiting_query.id = Math.random().toFixed(3);
    new_awaiting_query.query = query;

    console.log(this.id, new_awaiting_query.id, '+ Creating awaiting query');
    this.awaiting_queries.add(new_awaiting_query);

    return new_query_promise;

  }

  transformResult(result) {

    du.debug('Transform Result');

    if (arrayutilities.isArray(result)) {

      let return_array = [];

      if (result.length > 0) {

        return_array = arrayutilities.map(result, (result_thing) => {

          return objectutilities.clone(result_thing);

        });

      }

      return return_array;

    } else if (objectutilities.isObject(result)) {

      if (_.has(result, 'rows')) {
        return result.rows;
      }

      eu.throwError('server', 'Result does not have rows property');

    } else {

      eu.throwError('server', 'Unrecognized return type');

    }

    return result;

  }

  queryRaw(query, parameters) {

    du.debug('Query Raw');

    if (_.isUndefined(parameters)) {
      parameters = [];
    }

    return new Promise((resolve) => {

      if (!_.has(this, 'redshift_connection')) {
        eu.throwError('server', 'Unset redshift_connection.');
      }

      if (!_.isFunction(this.redshift_connection.query)) {
        eu.throwError('server', 'Unable to query redshift.');
      }

      return this.redshift_connection.query(query, parameters, (error, result) => {

        if (error) {
          eu.throwError('server', error);
        }

        result = this.transformResult(result);

        return resolve(result);

      });

    });

  }

  openConnection() {

    console.log(this.id, '+++ Init Opening Connection');

    this.connection_status_change_promise = this.connection_status_change_promise
      .catch() // actually we need finally(), promisified approach to CRITICAL_SECTION
      .then(() => {
        if (this.redshift_is_opened_connection) {
          console.log(this.id, '+++++++ Reusing Opened Connection');
          return Promise.resolve(this.redshift_is_opened_connection);
        }

        return new Promise((resolve) => {

          if (!_.has(this, 'redshift_connection')) {
            eu.throwError('server', 'Unset redshift_connection.');
          }

          if (!_.isFunction(this.redshift_connection.connect)) {
            eu.throwError('server', 'redshift_connection.connect is not a function.');
          }

          console.log(this.id, '+++++ Opening Connection');
          this.redshift_connection.connect((error) => {

            if (error) {
              console.log(this.id, '+++++++ Failed to Open Connection!!!!!!!!!!!!!!!', error);
              eu.throwError('server', error);
            }
            console.log(this.id, '+++++++ Opened Connection');

            this.scheduleQuit();

            this.redshift_is_opened_connection = true;

            return resolve(this.redshift_is_opened_connection);

          });
        })

      })
      .catch((error) => {
        this.redshift_is_opened_connection = false;
        return Promise.reject(error);
      });

    return this.connection_status_change_promise;
  }

  //note, we might want to loosen constraints here...
  closeConnection() {

    console.log('--- Init Closing Connection');

    this.connection_status_change_promise = this.connection_status_change_promise
      .catch() // actually we need finally(), promisified approach to CRITICAL_SECTION
      .then(() => new Promise((resolve, reject) => {

        if (!_.has(this, 'redshift_connection')) {
          eu.throwError('server', 'Unset redshift_connection.');
        }

        if (!_.isFunction(this.redshift_connection.end)) {
          eu.throwError('server', 'redshift_connection.end is not a function.');
        }

        console.log('----- Closing Connection');
        this.redshift_connection.end((error) => {
          console.log('------- Closed Connection');
          if (error) {
            return reject(error);
          }
          this.redshift_is_opened_connection = false;
          return resolve(true)
        });

      }))
      .catch((error) => {
        this.redshift_is_opened_connection = false;
        return Promise.reject(error);
      });

    return this.connection_status_change_promise;

  }

  getHost() {
    if (global.SixCRM.configuration.stage === 'local') {
      return Promise.resolve(this.redshift_configuration.host);
    } else {
      return global.SixCRM.configuration.getEnvironmentConfig('redshift.host')
    }
  }

}

module.exports = new RedshiftQueryUtilities();
