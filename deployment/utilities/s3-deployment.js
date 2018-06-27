
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const fileutilities = require('@6crm/sixcrmcore/util/file-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;
const AWSDeploymentUtilities = global.SixCRM.routes.include('deployment', 'utilities/aws-deployment-utilities.js');
const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
const IAMProvider = global.SixCRM.routes.include('controllers', 'providers/iam-provider.js');

module.exports = class S3Deployment extends AWSDeploymentUtilities {

	constructor() {

		super();

		this.s3provider = new S3Provider();
		this.iamprovider = new IAMProvider();

		this.bucket_name_template = 'sixcrm-{{stage}}-{{bucket_name}}';


	}

	createBuckets() {

		du.debug('Create Buckets');

		let bucket_group_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment', 's3/buckets'));

		if (!_.isArray(bucket_group_files)) {
			throw eu.getError('server', 'S3Deployment.createBuckets assumes that the bucket_group_files is an array of file names.');
		}

		let bucket_promises = [];

		bucket_group_files.forEach((bucket_group_file) => {

			du.info(bucket_group_file);

			let bucket_group_file_contents = global.SixCRM.routes.include('deployment', 's3/buckets/' + bucket_group_file);

			if (!_.isArray(bucket_group_file_contents)) { throw eu.getError('server', 'S3Deployment.createBuckets assumes that the JSON files are arrays.'); }

			bucket_promises.push(this.createBucketFromGroupFileDefinition(bucket_group_file_contents));

		});

		return Promise.all(bucket_promises).then(() => {

			return 'Complete';

		});

	}
	createBackupBuckets() {

		du.debug('Create Backup Buckets');

		let bucket_group_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment', 's3/buckets_backup'));

		if (!_.isArray(bucket_group_files)) {
			throw eu.getError('server', 'S3Deployment.createBackupBuckets assumes that the bucket_group_files is an array of file names.');
		}

		let bucket_promises = [];

		bucket_group_files.forEach((bucket_group_file) => {

			du.info(bucket_group_file);

			let bucket_group_file_contents = global.SixCRM.routes.include('deployment', 's3/buckets/' + bucket_group_file);

			if (!_.isArray(bucket_group_file_contents)) { throw eu.getError('server', 'S3Deployment.createBuckets assumes that the JSON files are arrays.'); }

			bucket_promises.push(this.createBucketFromGroupFileDefinition(bucket_group_file_contents));

		});

		return Promise.all(bucket_promises).then(() => {

			return 'Complete';

		});

	}

	destroyBuckets() {

		du.debug('Destroy Buckets');

		let bucket_group_files = fileutilities.getDirectoryFilesSync(global.SixCRM.routes.path('deployment', 's3/buckets'));

		if (!_.isArray(bucket_group_files)) { throw eu.getError('server', 'S3Deployment.destroyBuckets assumes that the bucket_group_files is an array of file names.'); }

		let bucket_promises = [];

		bucket_group_files.forEach((bucket_group_file) => {

			let bucket_group_file_contents = global.SixCRM.routes.include('deployment', 's3/buckets/' + bucket_group_file);

			if (!_.isArray(bucket_group_file_contents)) { throw eu.getError('server', 'S3Deployment.destroyBuckets assumes that the JSON files are arrays.'); }

			bucket_promises.push(this.deleteBucketFromGroupFileDefinition(bucket_group_file_contents));

		});

		return Promise.all(bucket_promises).then(() => {

			return 'Complete';

		});

	}

	createBucketPath(bucket_name, prepended_path) {

		let return_path = bucket_name;

		if (!_.isUndefined(prepended_path)) {

			return_path = prepended_path + '/' + return_path;

		}

		return return_path;

	}

	createBucketFromGroupFileDefinition(group_file_definition) {

		du.debug('Create Bucket From Group File Definition');

		let group_file_definition_promises = group_file_definition.map((sub_definition) => {

			let bucket_name = this.createEnvironmentSpecificBucketName(sub_definition.Bucket);

			sub_definition.Bucket = bucket_name;

			return this.s3provider.assureBucket(sub_definition);

		});

		return Promise.all(group_file_definition_promises);

	}

	deleteBucketFromGroupFileDefinition(group_file_definition) {

		let group_file_definition_promises = group_file_definition.map((sub_definition) => {

			let bucket_name = this.createEnvironmentSpecificBucketName(sub_definition.Bucket);

			return this.s3provider.assureDelete(bucket_name);

		});

		return Promise.all(group_file_definition_promises);

	}

	bucketExists(parameters) {

		var param = {
			Bucket: parameters.Bucket
		};

		return new Promise((resolve) => {
			this.s3.headBucket(param, (error) => {
				if (error) {
					return resolve(false);
				} else {
					return resolve(true);
				}
			});
		});

	}

	createEnvironmentSpecificBucketName(bucket_name) {

		return parserutilities.parse(this.bucket_name_template, { stage: process.env.stage, bucket_name: bucket_name });

	}

	configureBackups() {

		du.debug('Configure Bucket Backup');

		let bucket_replication_promises = [];

		let backup_definitions = global.SixCRM.routes.include('deployment', 's3/configuration/backup_defintions.json');

		if (!_.isArray(backup_definitions)) { throw eu.getError('server', 'S3Deployment.configureBucketBackup assumes that the JSON files are arrays.'); }

		backup_definitions.forEach((backup_definition) => {

			bucket_replication_promises.push(this.executeConfigureBackups(backup_definition));

		});

		return Promise.all(bucket_replication_promises).then(() => {

			return 'Complete';

		});
	}

	executeConfigureBackups(backup_definition) {

		du.debug('Execute Bucket Backup');

		let source_bucket = this.createEnvironmentSpecificBucketName(backup_definition.source);
		let destination_bucket = this.createEnvironmentSpecificBucketName(backup_definition.destination);


		return this.s3provider.putBucketVersioning(source_bucket)
			.then(() => this.s3provider.putBucketVersioning(destination_bucket))
			.then(() => this.getReplicationRole())
			.then(replication_role => this.s3provider.putBucketReplication({
				source: source_bucket,
				destination: destination_bucket,
				role: replication_role.Role.Arn
			}))
			.then(() => this.s3provider.putBucketLifecycleConfiguration(destination_bucket));

	}

	getReplicationRole() {

		du.debug('Get Replication Role');

		let role_definition = global.SixCRM.routes.include('deployment', 'iam/roles/s3_replication.json');

		du.warning(role_definition);

		return this.iamprovider.roleExists({ RoleName: role_definition[0].RoleName })
			.then(result => {

				if (result == false) {

					throw eu.getError('server', 'Role does not exist: ' + role_definition[0].RoleName);

				}

				return Promise.resolve(result);

			});

	}

}
