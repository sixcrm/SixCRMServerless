'use strict';

const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const RedshiftDeployment = global.SixCRM.routes.include('deployment', 'utilities/redshift-deployment.js');

class RedshiftClusterDeployment extends RedshiftDeployment {

  constructor() {

    super();

  }

  deleteClusterAndWait() {

    du.debug('Delete Cluster and Wait');

    let parameters = this.createParametersObject('destroy');

    return this.redshiftutilities.deleteCluster(parameters).then(() => {

      let parameters = this.createParametersObject('wait');

      return this.redshiftutilities.waitForCluster('clusterDeleted', parameters);

    });

  }

  createClusterAndWait() {

    du.debug('Create Cluster and Wait');

    let parameters = this.createParametersObject('create');

    return this.appendSecurityGroupIDs(parameters).then((parameters) => {

      return this.redshiftutilities.createCluster(parameters).then(() => {

        parameters = this.createParametersObject('wait');

        return this.redshiftutilities.waitForCluster('clusterAvailable', parameters).then((data) => {

          return this.writeHostConfiguration(data).then(() => {

            return data;

          });

        })

      });

    });

  }

  destroy() {

    du.debug('Destroy Cluster');

    let parameters = this.createParametersObject('describe');

    return this.redshiftutilities.clusterExists(parameters).then(exists => {

      if (!exists) {

        return Promise.resolve('Cluster does not exist, aborting.');

      } else {

        du.output('Cluster exists, destroying.');

        return this.deleteClusterAndWait().then(() => {

          return 'Cluster destroyed.';

        });

      }

    });

  }

  deploy() {

    du.debug('Deploy Cluster');

    let parameters = this.createParametersObject('describe');

    return this.redshiftutilities.clusterExists(parameters).then(exists => {

      if (exists) {

        return Promise.resolve('Cluster exists, aborting.');

      } else {

        du.output('Cluster does not exist, creating.');

        return this.createClusterAndWait().then(() => {

          return 'Cluster created.';

        });

      }

    });

  }

  createParametersObject(group_name) {

    let response_object = {};

    let configuration_groups = {
      'describe': ['ClusterIdentifier'],
      'wait': ['ClusterIdentifier'],
      'create': ['ClusterIdentifier', 'NodeType', 'MasterUsername', 'MasterUserPassword', 'ClusterType','NumberOfNodes', 'DBName', 'AutomatedSnapshotRetentionPeriod', 'PubliclyAccessible', 'Port', 'IamRoles'],
      'destroy': ['ClusterIdentifier', 'FinalClusterSnapshotIdentifier', 'SkipFinalClusterSnapshot']
    };

    let translation_object = {
      ClusterIdentifier: ['cluster_identifier'],
      NodeType: ['node_type'],
      DBName: ['database'],
      ClusterType: ['cluster_type'],
      NumberOfNodes: ['number_of_nodes'],
      AutomatedSnapshotRetentionPeriod: ['automated_snapshot_retention_period'],
      PubliclyAccessible: ['publicly_accessible'],
      SkipFinalClusterSnapshot: ['skip_final_cluster_snapshot'],
      FinalClusterSnapshotIdentifier: ['final_cluster_snapshot_identifier'],
      Port: ['port'],
      IamRoles:['iam_roles']
    };

    configuration_groups[group_name].forEach((key) => {

      let discovered_data = objectutilities.recurseByDepth(this.configuration_file, function(p_key) {

        return (_.contains(translation_object[key], p_key));

      });

      response_object[key] = discovered_data;

    });

    if(_.contains(['create'], group_name)){

      if(_.has(response_object, 'IamRoles')){

        if(arrayutilities.isArray(response_object.IamRoles) && response_object.IamRoles.length > 0){

          let account_id = global.SixCRM.configuration.getAccountIdentifier();

          response_object.IamRoles = arrayutilities.map(response_object.IamRoles, (role_arn_template) => {

            return parserutilities.parse(role_arn_template, {aws_account_id: account_id});

          });

        }

      }

      response_object['MasterUsername'] = global.SixCRM.configuration.site_config.redshift.user;
      response_object['MasterUserPassword'] = global.SixCRM.configuration.site_config.redshift.password;

    }

    return response_object;

  }

  appendSecurityGroupIDs(parameters){

    du.debug('Append Security Group IDs');

    if(_.has(this.configuration_file.cluster, 'security_group_names')){

      if(!_.has(this, 'ec2utilities')){
        let EC2Utilities = global.SixCRM.routes.include('lib', 'ec2-utilities.js');

        this.ec2utilities =  new EC2Utilities();
      }

      if(!_.has(parameters, 'VpcSecurityGroupIds')){
        parameters.VpcSecurityGroupIds = [];
      }

      let security_group_names = this.configuration_file.cluster.security_group_names;

      let security_group_promises = arrayutilities.map(security_group_names, (security_group_name) => {

        return this.ec2utilities.securityGroupExists(security_group_name).then((security_group) => {

          if(_.has(security_group, 'GroupId')){

            parameters.VpcSecurityGroupIds.push(security_group.GroupId);

            return true;

          }else{

            return eu.throwError('server', 'Security group does not exist: '+security_group_name);

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

    du.debug('Write Host Configuration');

    if(!objectutilities.hasRecursive(data, 'Clusters.0.Endpoint.Address')){

      eu.throwError('server', 'Data object does not contain appropriate key: Clusters.0.Endpoint.Address');

    }

    let host = data['Clusters'][0]['Endpoint']['Address'];

    if(!_.isNull(host)){

      if(stringutilities.isMatch(host, /^[a-zA-Z0-9\.-:]*$/)){

        return global.SixCRM.configuration.setEnvironmentConfig('redshift.host', host);

      }else{

        eu.throwError('server', 'Attempting to set redshift.host configuration globally when value does not match regular expression validation.');

      }

    }else{

      eu.throwError('server', 'Attempting to set a null or redshift.host configuration globally.');

    }

  }

}

module.exports = new RedshiftClusterDeployment();
