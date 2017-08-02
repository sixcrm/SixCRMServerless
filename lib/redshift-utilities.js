'use strict';
require('../SixCRM.js');
const _ = require('underscore');
const AWS = require("aws-sdk");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
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

      du.debug('Create Cluster');

      let parameters = this.createParametersObject('create');

      return new Promise((resolve, reject) => {
        this.appendSecurityGroupIDs(parameters).then((parameters) => {
          this.redshift.createCluster(parameters, (error, data) => {
            if (error) {
              du.error(error.message);
              return reject(error);
            } else {
              return resolve(data);
            }
          });
        });
      });

    }

    appendSecurityGroupIDs(parameters){

      du.debug('Append Security Group IDs');

      if(_.has(global.SixCRM.configuration.site_config.redshift.cluster, 'security_group_names')){

        if(!_.has(this, 'ec2utilities')){
          let EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');

          this.ec2utilities =  new EC2Utilities();
        }

        if(!_.has(parameters, 'VpcSecurityGroupIds')){
          parameters.VpcSecurityGroupIds = [];
        }

        let security_group_names = global.SixCRM.configuration.site_config.redshift.cluster.security_group_names;

        let security_group_promises = arrayutilities.map(security_group_names, (security_group_name) => {

          return this.ec2utilities.securityGroupExists(security_group_name).then((security_group) => {

            if(_.has(security_group, 'GroupId')){

              parameters.VpcSecurityGroupIds.push(security_group.GroupId);

            }else{

              eu.throwError('server', 'Security group does not exist: '+security_group_name);

            }

          });

        });

        return Promise.all(security_group_promises).then(() => {
          return parameters;
        });

      }else{

        return Promise.resolve(parameters);

      }

    }

    writeHostConfiguration(data){

      let host = data['Clusters'][0]['Endpoint']['Address'];

      return global.SixCRM.configuration.propagateCache('all', 'redshift.host', host);

    }

    //Technical Debt: The parameters aquisition protion of this hould exist in the deployment utiltites, not here...
    createParametersObject(group_name){

      let response_object = {};

      let configuration_groups = {
        'describe': ['ClusterIdentifier'],
        'wait': ['ClusterIdentifier'],
        'create': ['ClusterIdentifier', 'NodeType', 'MasterUsername','MasterUserPassword','ClusterType', 'AutomatedSnapshotRetentionPeriod','PubliclyAccessible', 'Port'],
        'destroy': ['ClusterIdentifier', 'FinalClusterSnapshotIdentifier', 'SkipFinalClusterSnapshot']
      };

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

        //This shouldn't be here...
        let discovered_data = objectutilities.recurseByDepth(global.SixCRM.configuration.site_config.redshift, function(p_key){

          return (_.contains(translation_object[key], p_key));

        });

        response_object[key] = discovered_data;

      });

      return response_object;

    }

}

module.exports = new RedshiftUtilities();
