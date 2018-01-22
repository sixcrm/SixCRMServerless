'use strict';
require('../SixCRM.js');
const _ = require('underscore');
const AWS = require("aws-sdk");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js');

/*
* Technical Debt: Evaluate the manner by which we instantiate and connect on-demand.  In particular, client pooling is probably a good idea.
* Technical Debt: This utility executes arbitrary queries with little/no query sanitization.
* Technical Debt: Closing the connection to Redshift is blocking.
*/

class RedshiftUtilities extends AWSUtilities {

    constructor(){

      super();

      if (process.env.stage !== 'local') {

        this.redshift = new AWS.Redshift({
            region: global.SixCRM.configuration.site_config.aws.region,
            apiVersion: '2013-01-01',
        });

      }else{

        let endpoint = global.SixCRM.configuration.site_config.redshift.endpoint+':'+global.SixCRM.configuration.site_config.redshift.port

        this.redshift = new AWS.Redshift({
            region: 'localhost',
            apiVersion: '2013-01-01',
            endpoint: endpoint
        });

      }

    }

    createClusterSnapshot(parameters){

      du.debug('Create Cluster Snapshot');

      parameters = (_.isUndefined(parameters) || !objectutilities.isObject(parameters, false))?{}:parameters;

      parameters = objectutilities.transcribe(
        {
          ClusterIdentifier:'ClusterIdentifier',
          SnapshotIdentifier: 'SnapshotIdentifier'
        },
        parameters,
        {},
        false
      );

      if(!_.has(parameters, 'ClusterIdentifier')){
        parameters.ClusterIdentifier = global.SixCRM.configuration.site_config.redshift.default_cluster_identifier;
      }

      if(!_.has(parameters, 'SnapshotIdentifier')){
        parameters.SnapshotIdentifier = 'sixtriggered-'+timestamp.getISO8601();
      }

      return new Promise((resolve, reject) => {

        return this.redshift.createClusterSnapshot(parameters, function(error, data) {

          if (error) {

            du.error(error);
            return reject(error);

          } else {

            if(objectutilities.hasRecursive(data, 'Snapshot.Status') && data.Snapshot.Status == 'creating'){
              return resolve(data);
            }

            du.error('Unexpected response from AWS', data);
            return reject(new Error('Unexpected response from AWS: '+data));

          }

        });

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

    describeCluster(parameters) {

        du.debug('Describe Cluster');

        return new Promise((resolve, reject) => {

            return this.redshift.describeClusters(parameters, (error, data) => {
                if (error) {

                    du.error(error);

                    return reject(error);
                } else {
                    return resolve(data);
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
