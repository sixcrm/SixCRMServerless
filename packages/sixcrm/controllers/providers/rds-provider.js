
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

/*
* Technical Debt: Evaluate the manner by which we instantiate and connect on-demand.  In particular, client pooling is probably a good idea.
* Technical Debt: This utility executes arbitrary queries with little/no query sanitization.
*/

module.exports = class RDSProvider extends AWSProvider {

	constructor(){

		super();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.rds = new this.AWS.RDS({
			apiVersion: '2014-10-31',
			region: this.getRegion(),
		});

	}

	createDBSubnetGroup(parameters){
		let params = objectutilities.transcribe(
			{
				DBSubnetGroupDescription: 'DBSubnetGroupDescription',
				DBSubnetGroupName: 'DBSubnetGroupName',
				SubnetIds: "SubnetIds",
				Tags:"Tags"
			},
			parameters,
			{},
			true
		);

		return this.rds.createDBSubnetGroup(params).promise();

	}

	describeDBSubnetGroups(parameters){
		return this.rds.describeDBSubnetGroups(parameters).promise();

	}

	createCluster(parameters){
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
				MasterUsername: 'MasterUsername',
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

		return this.rds.createDBCluster(params).promise();

	}

	describeClusters(parameters){
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
					return reject(error);
				}
				return resolve(data);
			});

		}).catch(error => {
			if(error.statusCode == '404'){
				return Promise.resolve({ResponseMetadata:{}, DBClusters:[]});
			}
			du.error(error);
			return Promise.reject(error);
		});

	}

	putCluster(parameters){
		return this.describeClusters(parameters).then(result => {

			if(arrayutilities.nonEmpty(result.DBClusters)){
				du.info('Cluster already exists: '+parameters.DBClusterIdentifier);
				return result;
			}

			return this.createCluster(parameters);

		});

	}

	createDBInstance(parameters){
		let params = objectutilities.transcribe(
			{
				DBInstanceClass: 'DBInstanceClass',
				DBInstanceIdentifier: 'DBInstanceIdentifier',
				Engine: 'Engine'
			},
			parameters,
			{},
			true
		);

		params = objectutilities.transcribe(
			{
				AllocatedStorage: "AllocatedStorage",
				AutoMinorVersionUpgrade: "AutoMinorVersionUpgrade",
				AvailabilityZone: "AvailabilityZone",
				BackupRetentionPeriod: "BackupRetentionPeriod",
				CharacterSetName: "CharacterSetName",
				CopyTagsToSnapshot: "CopyTagsToSnapshot",
				DBClusterIdentifier: "DBClusterIdentifier",
				DBName: "DBName",
				DBParameterGroupName: "DBParameterGroupName",
				DBSecurityGroups: "DBSecurityGroups",
				DBSubnetGroupName: "DBSubnetGroupName",
				Domain: "Domain",
				DomainIAMRoleName: "DomainIAMRoleName",
				EnableCloudwatchLogsExports: "EnableCloudwatchLogsExports",
				EnableIAMDatabaseAuthentication: "EnableIAMDatabaseAuthentication",
				EnablePerformanceInsights: "EnablePerformanceInsights",
				EngineVersion: "EngineVersion",
				Iops: "Iops",
				KmsKeyId: "KmsKeyId",
				LicenseModel: "LicenseModel",
				MasterUserPassword: "MasterUserPassword",
				MasterUsername: "MasterUsername",
				MonitoringInterval: "MonitoringInterval",
				MonitoringRoleArn: "MonitoringRoleArn",
				MultiAZ: "MultiAZ",
				OptionGroupName: "OptionGroupName",
				PerformanceInsightsKMSKeyId: "PerformanceInsightsKMSKeyId",
				Port: "Port",
				PreferredBackupWindow: "PreferredBackupWindow",
				PreferredMaintenanceWindow: "PreferredMaintenanceWindow",
				PromotionTier: "PromotionTier",
				PubliclyAccessible: "PubliclyAccessible",
				StorageEncrypted: "StorageEncrypted",
				StorageType: "StorageType",
				Tags: "Tags",
				TdeCredentialArn: "TdeCredentialArn",
				TdeCredentialPassword: "TdeCredentialPassword",
				Timezone: "Timezone",
				VpcSecurityGroupIds: "VpcSecurityGroupIds"
			},
			parameters,
			params
		);

		return new Promise((resolve, reject) => {

			this.rds.createDBInstance(params, (error, data) => {
				if(error){
					return reject(error);
				}
				return resolve(data);
			});

		});

	}

	putDBInstance(parameters){
		return this.describeDBInstances(parameters).then(result => {

			if(_.isObject(result) && objectutilities.hasRecursive(result, 'DBInstances.0.DBInstanceArn')){
				du.info('Instance Already Exists');
				return result.DBInstances[0];
			}

			return this.createDBInstance(parameters).then(result => {
				du.info('Database instance created.');
				du.info(result);
				return result;
			});

		});

	}

	describeDBInstances(parameters){
		let params = objectutilities.transcribe(
			{
				DBInstanceIdentifier: "DBInstanceIdentifier",
				Filters:"Filters",
				Marker:"Marker",
				MaxRecords:"MaxRecords"
			},
			parameters,
			{}
		);

		return new Promise((resolve, reject) => {

			this.rds.describeDBInstances(params, (error, data) => {

				if(error){
					return reject(error);
				}
				return resolve(data);

			});

		}).catch(error => {
			if(error.statusCode == '404'){
				return Promise.resolve({ResponseMetadata:{}, DBInstances:[]});
			}
			du.error(error);
			return Promise.reject(error);
		});

	}

	waitFor(event_name, parameters){
		return this.rds.waitFor(event_name, parameters).promise();

	}

}
