'use strict';
require('../SixCRM.js');
const _ = require('underscore');
const AWS = require("aws-sdk");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js');

/*
* Technical Debt: Evaluate the manner by which we instantiate and connect on-demand.  In particular, client pooling is probably a good idea.
* Technical Debt: This utility executes arbitrary queries with little/no query sanitization.
* Technical Debt: Closing the connection to Redshift is blocking.
*/

class RedshiftUtilities extends AWSUtilities {

    constructor(){

      super();

      this.redshift = new AWS.Redshift({
          region: global.SixCRM.configuration.site_config.aws.region,
          apiVersion: '2013-01-01',
      });

    }

    clusterExists(parameters) {

      du.debug('Cluster Exists');

      return new Promise((resolve) => {

          return this.redshift.describeClusters(parameters, (error, data) => {
              if (error) {
                  return resolve(false);
              } else {
                if(_.has(data, 'Clusters') && _.isArray(data.Clusters) && data.Clusters.length > 0){
                  return resolve(true);
                }else{
                  return resolve(false)
                }

              }
          });

      });

    }

    deleteCluster(parameters) {

      du.debug('Delete Cluster');

      //let parameters = this.createParametersObject('destroy');

      return new Promise((resolve, reject) => {
          this.redshift.deleteCluster(parameters, (error, data) => {
              if (error) {
                  du.error(error.message);
                  return reject(error);
              } else {
                  return resolve(data);
              }
          });
      });

    }

    waitForCluster(state, parameters) {

      //let parameters = this.createParametersObject('wait');

      return new Promise((resolve, reject) => {
          this.redshift.waitFor(state, parameters, (error, data) => {
              if (error) {
                  du.error(error.message);
                  return reject(error);
              } else {
                  return resolve(data);
              }
          });
      });

    }

    createCluster(parameters) {

      du.debug('Create Cluster');

      return new Promise((resolve, reject) => {
        this.redshift.createCluster(parameters, (error, data) => {
          if (error) {
            du.error(error.message);
            return reject(error);
          } else {
            return resolve(data);
          }
        });
      });

    }

}

module.exports = new RedshiftUtilities();
