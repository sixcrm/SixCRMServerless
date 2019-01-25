
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class S3Provider extends AWSProvider {

	constructor() {

		super();

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.s3 = new this.AWS.S3({
			apiVersion: '2006-03-01',
			region: this.getRegion()
		});

		this.maximum_delete_batch_size = 1000;

	}

	assureDelete(bucket_name) {


		return new Promise((resolve, reject) => {

			return this.bucketExists(bucket_name).then((result) => {

				if (result == true) {

					return this.deleteBucket(bucket_name).then(() => {

						return resolve(true);

					}).catch((error) => {

						du.warning('S3 error (destroy bucket): ', error);

						return reject(error);

					});

				} else {

					du.warning('Bucket does not exist: "' + bucket_name + '"');

					return resolve(false);

				}

			});

		});

	}

	objectExists(parameters) {
		/* Test if object exists */

		if (!_.has(parameters, 'Bucket')) {
			throw eu.getError('server', 'This operation requires a "Bucket" parameter.');
		}

		if (!_.has(parameters, 'Key')) {
			throw eu.getError('server', 'This operation requires a "Key" parameter.');
		}

		return new Promise((resolve) => {

			var param = {
				Bucket: parameters.Bucket,
				Key: parameters.Key
			};

			return this.s3.headObject(param, (error) => {

				if (error) {
					return resolve(false);
				} else {
					return resolve(true);
				}

			});

		});

	}

	deleteBucketObjects(bucket_name) {


		return this.listObjects(bucket_name, null, {
			Prefix: bucket_name + '/'
		}).then(bucket_objects => {

			return this.batchDeleteObjects(bucket_name, bucket_objects);

		});

	}

	listObjects(bucket_name, continuation_token, additional_properties) {


		return new Promise((resolve) => {

			let return_array = [];

			let parameters = {
				Bucket: bucket_name,
				MaxKeys: 1000
			};

			if (!_.isUndefined(continuation_token)) {
				parameters.ContinuationToken = continuation_token;
			}

			if (!_.isUndefined(additional_properties) && _.isObject(additional_properties)) {

				for (var key in additional_properties) {
					if (_.includes(['Delimiter', 'EncodingType', 'FetchOwner', 'StartAfter', 'RequestPayer', 'Prefix'], key)) {
						parameters[key] = additional_properties[key];
					}
				}

			}

			this.s3.listObjectsV2(parameters, (error, data) => {

				if (error) {
					throw eu.getError('server', error);
				}

				if (_.has(data, 'Contents')) {

					return_array = arrayutilities.merge(return_array, data.Contents);

				}

				if (_.has(data, 'IsTruncated') && data.IsTruncated == true && _.has(data, 'NextContinuationToken')) {

					return this.listObjects(bucket_name, data.NextContinuationToken).then(more_objects => {

						return_array = arrayutilities.merge(return_array, more_objects);

						return resolve(return_array);

					});

				} else {

					return resolve(return_array);

				}

			});


		});

	}

	batchDeleteObjects(bucket_name, bucket_objects) {


		return new Promise((resolve) => {

			if (!_.isArray(bucket_objects)) {
				throw eu.getError('server', 'Delete Objects assumes that the bucket objects argument is an array.');
			}

			if (bucket_objects.length < 1) {

				return resolve(false);

			}

			let delete_bucket_objects = bucket_objects.map((bucket_object) => {

				if (!_.has(bucket_object, 'Key')) {
					throw eu.getError('server', 'Malformed bucket object.');
				}

				return {
					Key: bucket_object.Key
				};

			});

			delete_bucket_objects = arrayutilities.chunk(delete_bucket_objects, this.maximum_delete_batch_size);

			let delete_bucket_object_promises = delete_bucket_objects.map((delete_bucket_object) => {

				du.info(delete_bucket_object);

				return this.deleteObjects(bucket_name, delete_bucket_object);

			});

			return Promise.all(delete_bucket_object_promises).then((delete_bucket_objects) => {

				du.info(delete_bucket_objects);

				return resolve(true);

			});

		});

	}

	deleteObjects(bucket_name, bucket_objects) {

		return new Promise((resolve) => {

			if (!_.isArray(bucket_objects)) {

				throw eu.getError('server', 'S3Provider.deleteObjects assumes bucket_objects to be an array');

			}

			if (bucket_objects.length > this.maximum_delete_batch_size) {

				throw eu.getError('server', 'S3Provider.deleteObjects bucket_objects array is too large');

			}

			let parameters = {
				Bucket: bucket_name,
				Delete: {
					Objects: bucket_objects
				}
			};

			this.s3.deleteObjects(parameters, (error, data) => {

				if (error) {
					du.error(error);
					throw eu.getError('server', error.message);
				}

				return resolve(data);

			});

		});

	}

	deleteBucket(bucket_name) {


		return new Promise((resolve, reject) => {

			let parameters = {
				Bucket: bucket_name
			};

			return this.deleteBucketObjects(bucket_name)
				.then(() => {

					return this.s3.deleteBucket(parameters, (error, data) => {

						if (error) {
							du.error(error);
							return reject(eu.getError('server', error.message));

						}

						return resolve(data);

					});

				});

		});

	}

	assureBucket(parameters) {
		return new Promise((resolve, reject) => {

			let bucket_name = parameters.Bucket;

			this.bucketExists(bucket_name).then((result) => {

				if (result !== true) {

					du.info(bucket_name + ' bucket not found, creating');

					return this.createBucket(parameters).then(() => {

						du.info(bucket_name + ' bucket created');

						return resolve(true);

					}).catch((error) => {

						du.warning('S3 error (create bucket): ', error);

						return reject(error);

					});

				} else {

					du.info(bucket_name + ' bucket found, skipping');

					return resolve(true);

				}

			}).catch((error) => {

				return reject(error);

			});

		});

	}

	headObject(parameters) {
		return this.s3.headObject(parameters).promise();
	}

	headBucket(bucket_name) {


		return new Promise((resolve, reject) => {

			let parameters = {
				Bucket: bucket_name
			};

			return this.s3.headBucket(parameters, function(error, data) {

				if (error) {

					du.error(error);

					if (error.code == 'Forbidden') {

						return resolve(null);

					} else if (error.code == 'NotFound') {

						return resolve(null);

					} else {

						du.warning('S3 error (head bucket): ', error);

						return reject(error);

					}

				}

				return resolve(data);

			});

		});

	}

	upload(parameters) {
		return this.s3.upload(parameters).promise();
	}

	putObject(parameters) {
		if (process.env.TEST_MODE === 'true') {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {

			if (!_.has(parameters, 'Bucket')) {
				return reject('This operation requires a "Bucket" parameter.');
			}

			if (!_.has(parameters, 'Key')) {
				return reject('This operation requires a "Key" parameter.');
			}

			if (!_.has(parameters, 'Body')) {
				return reject('This operation requires a "Body" parameter.');
			}

			this.s3.putObject(parameters, function(error, data) {

				if (error) {

					du.warning('S3 error (put object): ', error);

					return reject(error);

				}

				return resolve(data);

			});

		});

	}

	createBucket(parameters) {
		if (process.env.TEST_MODE === 'true') {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {

			this.s3.createBucket(parameters, function(error, data) {

				if (error) {
					du.info(parameters);

					return reject(error);

				}

				return resolve(data);

			});

		});

	}

	getBucketList(use_cache) {
		if (_.isUndefined(use_cache)) {

			use_cache = true;

		}

		if (_.has(this, 'bucket_list')) {

			if (use_cache == true) {

				return Promise.resolve(this.bucket_list);

			}

		}

		return this.listBuckets().then((bucket_list) => {

			let processed_bucket_list = bucket_list.Buckets.map(bucket_properties => {

				return bucket_properties.Name;
			});

			if (use_cache == true) {

				this.bucket_list = processed_bucket_list;

			}

			return processed_bucket_list;

		});

	}

	listBuckets() {
		return new Promise((resolve) => {

			this.s3.listBuckets((error, data) => {

				if (error) {
					du.error(error);
					throw eu.getError('server', error.message);
				}

				return resolve(data);

			});

		});

	}

	bucketExists(bucket_name) {


		return this.getBucketList().then((bucket_list) => {

			return _.includes(bucket_list, bucket_name);

		});

	}

	getObject(bucket, path) {
		let parameters = {
			Bucket: bucket,
			Key: path
		};

		return this.s3.getObject(parameters).promise();

	}

	putBucketVersioning(bucket) {
		du.warning('versioning bucket:' ,bucket);

		return new Promise((resolve, reject) => {
			var params = {
				Bucket: bucket,
				VersioningConfiguration: {
					MFADelete: 'Disabled',
					Status: 'Enabled'
				}
			};

			this.s3.putBucketVersioning(params, function (error, data) {
				if (error) {

					du.warning('versioning error:', error);


					return reject(false);
				}

				du.warning('versioning response:', data);

				return resolve(data);

			});

		});
	}

	putBucketLifecycleConfiguration(bucket) {
		return new Promise((resolve, reject) => {

			var parameters = {
				Bucket: bucket,
				LifecycleConfiguration: {
					Rules: [
						{
							Filter: {
								Prefix: ''
							},
							ID: 'Glacier Cold Storage Backup',
							Status: 'Enabled',
							Transitions: [
								{
									Days: 365,
									StorageClass: 'GLACIER'
								}
							]
						}
					]
				}
			};

			du.warning(bucket);
			du.warning(parameters);


			this.s3.putBucketLifecycleConfiguration(parameters, (error, data) => {
				if (error) {

					du.warning(error);

					return reject(false);
				}

				return resolve(data);

			});

		});

	}

	putBucketReplication({source, destination, role}) {
		return new Promise((resolve, reject) => {
			var parameters = {
				Bucket: source,
				ReplicationConfiguration: {
					Role: role,
					Rules: [
						{
							Destination: {
								Bucket: 'arn:aws:s3:::' + destination,
								StorageClass: 'STANDARD'
							},
							Prefix: '',
							Status: 'Enabled'
						}
					]
				}
			};

			this.s3.putBucketReplication(parameters, (error, data) => {
				if (error) {

					du.warning(error);

					return reject(false);

				}

				return resolve(data);

			});

		});

	}


}
