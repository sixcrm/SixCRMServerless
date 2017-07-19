'use strict'
const _ = require('underscore');
const AWS = require("aws-sdk");

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');
const objectutilities = global.routes.include('lib', 'object-utilities.js');

/*
* Technical Debt: Evaluate the manner by which we instantiate and connect on-demand.  In particular, client pooling is probably a good idea.
* Technical Debt: This utility executes arbitrary queries with little/no query sanitization.
* Technical Debt: Closing the connection to Redshift is blocking.
*/

class RedshiftUtilities {

    constructor(stage){

      this.stage = configurationutilities.resolveStage(stage);

      this.site_config = configurationutilities.getSiteConfig(this.stage);

      this.redshift = new AWS.Redshift({
          region: this.site_config.aws.region,
          apiVersion: '2013-01-01',
      });

    }

    /***/

    clusterExists() {

      let parameters = this.createParametersObject('describe');

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

    deleteCluster() {

      let parameters = this.createParametersObject('destroy');

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

    waitForCluster(state) {

      let parameters = this.createParametersObject('wait');

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

    createCluster() {

      let parameters = this.createParametersObject('create');

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

    createParametersObject(group_name){

      let response_object = {};

      let configuration_groups = {
        'describe': ['ClusterIdentifier'],
        'wait': ['ClusterIdentifier'],
        'create': ['ClusterIdentifier', 'NodeType', 'MasterUsername','MasterUserPassword','ClusterType', 'AutomatedSnapshotRetentionPeriod','PubliclyAccessible', 'Port'],
        'destroy': ['ClusterIdentifier', 'FinalClusterSnapshotIdentifier', 'SkipFinalClusterSnapshot']
      }

      let translation_object = {
        ClusterIdentifier: ['cluster_identifier'],
        NodeType:['node_type'],
        MasterUsername: ['user'],
        MasterUserPassword: ['password'],
        ClusterType:['cluster_type'],
        AutomatedSnapshotRetentionPeriod: ['automated_snapshot_retention_period'],
        PubliclyAccessible: ['publicly_accessible'],
        SkipFinalClusterSnapshot: ['skip_final_cluster_snapshot'],
        FinalClusterSnapshotIdentifier: ['final_cluster_snapshot_identifier'],
        Port: ['port']
      };

      configuration_groups[group_name].forEach((key) => {

        let discovered_data = objectutilities.recurseByDepth(this.site_config.redshift, function(p_key){

          return (_.contains(translation_object[key], p_key));

        });

        response_object[key] = discovered_data;

      });

      //validate

      return response_object;

    }

}

module.exports = new RedshiftUtilities(process.env.stage);
