'use strict';
//require('../SixCRM.js');
//const _ = require('underscore');
const AWS = require("aws-sdk");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
//const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const AWSUtilities = global.SixCRM.routes.include('lib', 'aws-utilities.js');

/*
* Technical Debt: Evaluate the manner by which we instantiate and connect on-demand.  In particular, client pooling is probably a good idea.
* Technical Debt: This utility executes arbitrary queries with little/no query sanitization.
* Technical Debt: Closing the connection to Redshift is blocking.
*/

class RDSUtilities extends AWSUtilities {

  constructor(){

    super();

    this.rds = new AWS.RDS({
      apiVersion: '2014-10-31',
      region: global.SixCRM.configuration.site_config.aws.region,
    });

  }

  createCluster(parameters){

    du.debug('Create Cluster');

    let params = objectutilities.transcribe(
      {
        DBClusterIdentifier: 'DBClusterIdentifier',
        Engine: 'Engine',
      },
      parameters,
      {},
      true
    );

    params = objectutilities.transcribe(
      {
        AvailabilityZones: 'AvailabilityZones',
        BackupRetentionPeriod: 'BackupRetentionPeriod',
        CharacterSetName: 'CharacterSetName',
        DBClusterParameterGroupName: 'DBClusterParameterGroupName',
        DBSubnetGroupName: 'DBSubnetGroupName',
        DatabaseName: 'DatabaseName',
        EnableIAMDatabaseAuthentication: 'EnableIAMDatabaseAuthentication',
        EngineVersion: 'EngineVersion',
        KmsKeyId: 'KmsKeyId',
        MasterUserPassword: 'MasterUserPassword',
        MasterUsername: 'masterUsername',
        OptionGroupName: 'OptionGroupName',
        Port: 'Port',
        PreSignedUrl: 'PreSignedUrl',
        PreferredBackupWindow: 'PreferredBackupWindow',
        PreferredMaintenanceWindow: 'PreferredMaintenanceWindow',
        ReplicationSourceIdentifier: 'ReplicationSourceIdentifier',
        SourceRegion: 'SourceRegion',
        StorageEncrypted: 'StorageEncrypted',
        Tags: 'Tags',
        VpcSecurityGroupIds: 'VpcSecurityGroupIds'
      },
      parameters,
      params,
      false
    );

    return new Promise((resolve, reject) => {
      this.rds.createDBCluster(params, (error, data) => {
        if(error){
          du.error(error);
          return reject(error);
        }
        return resolve(data);           // successful response
      });
    });

  }

  describeClusters(parameters){

    du.debug('Describe Clusters');

    let params = objectutilities.transcribe(
      {
        DBClusterIdentifier:'DBClusterIdentifier',
        Filters:'Filters',
        Marker: 'Marker',
        MaxRecords:'MaxRecords'
      },
      parameters,
      {}
    );

    return new Promise((resolve, reject) => {

      this.rds.describeDBClusters(params, function(error, data) {
        if(error){
          du.error(error);
          return reject(error);
        }
        return resolve(data);
      });

    });

  }
}

module.exports = new RDSUtilities();
