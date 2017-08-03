'use strict'
const _ = require('underscore');
const pg = require('pg');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const fileutilities = global.SixCRM.routes.include('lib', 'file-utilities.js');

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
          'host',
          'port',
          'idle_timeout'
      ];

      this.configFile = this.loadLocalConfig();

    }

    loadLocalConfig() {
     return JSON.parse(fileutilities.getFileContentsSync(global.SixCRM.routes.path('deployment', 'redshift/config/master.json')))
    }

    instantiateRedshift(){

      du.debug('Instantiate Redshift');

      let errors = [];

      this.required_configuration.forEach((configuration_parameter) => {

          if(!_.has(this.configFile, configuration_parameter)){

              errors.push('Missing Redshift configuration parameter: '+configuration_parameter);

          }

      });

      if(errors.length > 0){

          eu.throwError('server','Redshift connection errors: '+errors.join(', '));

      }else{

          // If host exists in local config take that one
          return global.SixCRM.configuration.getEnvironmentConfig('redshift.host').then((host) => {

              let pg_config = {
                  user: this.configFile.user,
                  database: this.configFile.database,
                  password: this.configFile.password,
                  host: this.configFile.host ? this.configFile.host : host,
                  port: this.configFile.port,
                  idleTimeoutMillis: this.configFile.idle_timeout
              };

              this.redshift_connection = new pg.Client(pg_config);

              return Promise.resolve();
          });

      }

    }

    query(query, parameters){

          du.debug('Query Redshift');

          return new Promise((resolve, reject) => {

              return this.instantiateRedshift().then(() => {

                  return this.openConnection().then(() => {

                      return this.redshift_connection.query(query, parameters, (error, result) => {

                          return this.closeConnection().then(() => {

                              if (error){ return reject(error); }

                              return resolve(result.rows);

                          });

                      });

                  });
              });

          });

    }

    /**
     * Don't initiate, or manage connection. Just execute query.
     *
     * @param query
     * @param parameters
     * @returns {Promise}
     */
    queryRaw(query, parameters) {

        du.debug('Query Redshift without closing connection.');

        return new Promise((resolve, reject) => {

            return this.redshift_connection.query(query, parameters, (error, result) => {

                if (error) {
                    return reject(error);
                }

                return resolve(result.rows);

            });

        });
    }

    openConnection(){

        du.debug('Open Connection');

        return new Promise((resolve, reject) => {

            this.redshift_connection.connect((error) => {

                if (error){  return reject(error); }

                return resolve(true);

            });

        });

    }

    closeConnection(){

        du.debug('Close Connection');

        return new Promise((resolve, reject) => {

            this.redshift_connection.end((error) => {

                if (error){ return reject(error); }

            });

            return resolve(true);

        });

    }

}

module.exports = new RedshiftQueryUtilities();
