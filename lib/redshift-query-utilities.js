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

    this.pg = pg;
    this.db_client = null;
    this.disconnecting_timer = null;
    this.disconnecting_timer_timeout_ms = 10;
    this.awaiting_queries = new Set();
    this.changing_connection_status_promise = Promise.resolve();
  }

  getHost() {
    if (global.SixCRM.configuration.stage === 'local') {
      return Promise.resolve(this.redshift_configuration.host);
    } else {
      return global.SixCRM.configuration.getEnvironmentConfig('redshift.host')
    }
  }

  getDBConfig() {
    du.debug('Getting Redshift config');
    if (this.db_config) return Promise.resolve(this.db_config);

    let errors = [];

    this.required_configuration.forEach((configuration_parameter) => {

      if (!_.has(this.redshift_configuration, configuration_parameter)) {

        errors.push('Missing Redshift configuration parameter: ' + configuration_parameter);

      }

    });

    if (errors.length > 0) {

      return Promise.reject(eu.getError('server', 'Redshift connection errors: ' + errors.join(', ')));

    }
    return this.getHost().then((host) => {

      if (_.isNull(host)) {

        du.highlight('Set host is ' + host);

        if (!_.has(this.redshift_configuration, 'host')) {

          return Promise.reject(eu.getError('server', 'Unable to establish Redshift host.'));

        }

        du.warning('Redshift host unset in S3 configuration file...');

        host = this.redshift_configuration.host;

      }

      du.info('Redshift host: ' + host);

      this.db_config = {
        user: this.redshift_configuration.user,
        database: this.redshift_configuration.database,
        password: this.redshift_configuration.password,
        host: host,
        port: this.redshift_configuration.port,
        // idleTimeoutMillis: this.redshift_configuration.idle_timeout TODO: remove it from very config
        statement_timeout: 10000 // TODO: make configurable - timeout limit for each query
      };

      return this.db_config;

    });

  }

  getConnection() {

    this.changing_connection_status_promise = this.changing_connection_status_promise
      .catch(() => {}) // actually we need finally(), promisified approach to CRITICAL_SECTION
      .then(() => {
        if (this.db_client) return Promise.resolve(this.db_client);

        return this.getDBConfig()
          .then((config) => {

            let new_db_client = null;

            if (!_.has(this, 'pg')) {
              return Promise.reject(eu.getError('server', 'Unset pg.'));
            }

            try {
              new_db_client = new this.pg.Client(config);
            } catch (error) {
              return Promise.reject(error);
            }

            if (!_.isFunction(new_db_client.connect)) {
              return Promise.reject(eu.getError('server', 'db.connect is not a function.'));
            }

            return new_db_client.connect()
              .then(() => {
                this.rescheduleDisconnect();

                this.db_client = new_db_client;

                return this.db_client;
              });

          })
      })
      .catch((error) => {
        this.db_client = null;
        return Promise.reject(error);
      });

    return this.changing_connection_status_promise;
  }

  rescheduleDisconnect() {

    if (this.disconnecting_timer) {
      clearTimeout(this.disconnecting_timer);
    }

    this.disconnecting_timer = setTimeout(() => {

      if (this.awaiting_queries.size > 0) {
        return Promise.all([...this.awaiting_queries])
          .catch(() => {}).then(() => {
            this.rescheduleDisconnect()
          });
      }

      this.closeConnection()
        .catch((error) => {
          du.error(error);

          return Promise.reject(error);

        });
    }, this.disconnecting_timer_timeout_ms);

    return Promise.resolve();
  }

  closeConnection() {

    this.changing_connection_status_promise = this.changing_connection_status_promise
      .catch(() => {}) // actually we need finally(), promisified approach to CRITICAL_SECTION
      .then(() => {

        if (!_.has(this, 'db_client')) {
          return Promise.reject(eu.getError('server', 'Unset db_client.'));
        }

        if (!_.isFunction(this.db_client.end)) {
          return Promise.reject(eu.getError('server', 'db_client.end is not a function.'));
        }

        return this.db_client.end()
          .then(() => {

            this.db_client = null;

            return true;

          })
          .catch((error) => {

            this.db_client = null;

            return Promise.reject(error);

          });

      });

    return this.changing_connection_status_promise;

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

      return Promise.reject(eu.getError('server', 'Result does not have rows property'));

    } else {

      return Promise.reject(eu.getError('server', 'Unrecognized return type'));

    }

  }

  queryRaw(query, parameters) {

    du.debug('Query Raw');

    if (_.isUndefined(parameters)) {
      parameters = [];
    }

    if (!this.db_client) {
      return Promise.reject(eu.getError('server', 'Unset db_client.'));
    }

    if (!_.isFunction(this.db_client.query)) {
      return Promise.reject(eu.getError('server', 'Unable to query redshift.'));
    }

    return this.db_client.query(query, parameters)
      .then((result) => this.transformResult(result));

  }

  query(query, parameters) {

    let new_query_promise = this.getConnection()
      .then(() => {
        return this.queryRaw(query, parameters)
      })
      .then((result) => {

        this.rescheduleDisconnect();

        return result;

      })
      .catch(error => {

        this.rescheduleDisconnect();

        return Promise.reject(error);

      });

    let new_awaiting_query = new_query_promise
      .catch(() => true) // Making finally() analogue.
      .then(() => {

        if (!this.awaiting_queries.has(new_awaiting_query)) {

          du.error('Query promise not found after query execution!');

          return false;

        }

        this.awaiting_queries.delete(new_awaiting_query);

        return true;
      });

    this.awaiting_queries.add(new_awaiting_query);

    return new_query_promise;
  }

}

module.exports = new RedshiftQueryUtilities();
