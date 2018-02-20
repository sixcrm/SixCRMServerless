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

    constructor(){

      this.required_configuration = [
          'user',
          'password',
          'database',
          'port',
          'idle_timeout'
      ];

      this.redshift_configuration = global.SixCRM.configuration.site_config.redshift;

    }

    instantiateRedshift(){

      du.debug('Instantiate Redshift');

      let errors = [];

      this.required_configuration.forEach((configuration_parameter) => {

        if(!_.has(this.redshift_configuration, configuration_parameter)){

          errors.push('Missing Redshift configuration parameter: '+configuration_parameter);

        }

      });

      if(errors.length > 0){

          eu.throwError('server','Redshift connection errors: '+errors.join(', '));

      }else{

        return this.getHost().then((host) => {

          if(_.isNull(host)){

            du.highlight('Set host is '+host);

            if(_.has(this.redshift_configuration, 'host')){

              du.warning('Redshift host unset in S3 configuration file...');

              host = this.redshift_configuration.host;

            }else{

             eu.throwError('server', 'Unable to establish Redshift host.');

            }

          }else{

            du.info('Redshift host: '+host);

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

          if(objectutilities.getClassName(this.redshift_connection) !== 'Client'){
            //Technical Debt:  The response in local Docker Containers is different then the response in CircleCI docker containers.  Both work...
            //eu.throwError('server', 'Redshift connection returned unexpected results');
          }

          return Promise.resolve(this.redshift_connection);

        });

      }

    }

    query(query, parameters){

      du.debug('Query Redshift');

      return new Promise((resolve) => {

        return this.instantiateRedshift().then(() => {

          return this.openConnection().then(() => {

            return this.queryRaw(query, parameters).then((result) => {

              return this.closeConnection().then(() => {

                result = this.transformResult(result);

                return resolve(result);

              });

            });

          });

        }).catch(error => {
          eu.throwError('server', error);
        });

      });

    }

    transformResult(result){

      du.debug('Transform Result');

      if(arrayutilities.isArray(result)){

        let return_array = [];

        if(result.length > 0){

            return_array = arrayutilities.map(result, (result_thing) => {

              return objectutilities.clone(result_thing);

            });

        }

        return return_array;

      }else if (objectutilities.isObject(result)){

        if(_.has(result, 'rows')){
          return result.rows;
        }

        eu.throwError('server', 'Result does not have rows property');

      }else{

        eu.throwError('server', 'Unrecognized return type');

      }

      return result;

    }

    queryRaw(query, parameters) {

      du.debug('Query Raw');

      if(_.isUndefined(parameters)){
        parameters = [];
      }

      return new Promise((resolve) => {

        if(!_.has(this, 'redshift_connection')){
          eu.throwError('server', 'Unset redshift_connection.');
        }

        if(!_.isFunction(this.redshift_connection.query)){
          eu.throwError('server', 'Unable to query redshift.');
        }

        return this.redshift_connection.query(query, parameters, (error, result) => {

          if (error){ eu.throwError('server', error); }

          result = this.transformResult(result);

          return resolve(result);

        });

      });

    }

    openConnection(){

      du.debug('Open Connection');

      return new Promise((resolve) => {

        if(!_.has(this, 'redshift_connection')){
          eu.throwError('server', 'Unset redshift_connection.');
        }

        if(!_.isFunction(this.redshift_connection.connect)){
          eu.throwError('server', 'redshift_connection.connect is not a function.');
        }

        this.redshift_connection.connect((error) => {

          if(error){ eu.throwError('server', error); }

          return resolve(true);

        });

      });

    }

    //note, we might want to loosen constraints here...
    closeConnection(){

      du.debug('Close Connection');

      return new Promise((resolve, reject) => {

        if(!_.has(this, 'redshift_connection')){
          eu.throwError('server', 'Unset redshift_connection.');
        }

        if(!_.isFunction(this.redshift_connection.end)){
          eu.throwError('server', 'redshift_connection.end is not a function.');
        }

        this.redshift_connection.end((error) => {
          if (error){ return reject(error); }
        });

        return resolve(true);

      });

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
