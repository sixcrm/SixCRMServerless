'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const ConfigurationUtilities = global.SixCRM.routes.include('controllers', 'core/ConfigurationUtilities.js');
const CloudsearchProvider = global.SixCRM.routes.include('controllers', 'providers/cloudsearch-provider.js');
const RDSProvider = global.SixCRM.routes.include('controllers', 'providers/rds-provider.js');
const RedshiftProvider = global.SixCRM.routes.include('controllers', 'providers/redshift-provider.js');

module.exports = class Configuration extends ConfigurationUtilities {

	constructor(stage) {

		super();

		this.setConfigurationInformation();

		this.handleStage(stage);

		this.setConfigurationFiles();

		this.mandatory_config_names = {
			redshift_host: 'redshift.host',
			aurora_host: 'aurora.host',
			cloudsearch_domainendpoint: 'cloudsearch.domainendpoint'
		}

	}

	isLocal() {

		return !_.contains(['development', 'staging', 'production'], global.SixCRM.configuration.stage);

	}

	setConfigurationInformation() {

		this.config_bucket_template = 'sixcrm-{{stage}}-configuration-master';

		this.s3_environment_configuration_file_key = 'config.json';

	}

	handleStage(stage) {

		du.debug('Handle Stage');

		this.stage = this.resolveStage(stage);

		this.setEnvironmentVariable('stage', this.stage);

	}

	setConfigurationFiles() {

		du.debug('Set Configuration Files');

		this.serverless_config = this.getServerlessConfig();

		this.site_config = this.getSiteConfig();

		this.evaluateStatus();

	}

	setEnvironmentConfigurationFile() {

		du.debug('Set Environment Configuration Files');

		return this.getEnvironmentConfig(null, false, null).then((result) => {

			this.environment_config = result;

			this.evaluateStatus();

			return;

		});

	}

	getServerlessConfig() {

		du.debug('Get Serverless Config');

		return global.SixCRM.routes.include('root', 'serverless.yml');

	}

	getSiteConfig() {

		du.debug('Get Site Config');

		let config;

		try {

			config = global.SixCRM.routes.include('config', this.stage + '/site.yml');

		} catch (error) {

			eu.throwError('server', 'Configuration.getSiteConfig was unable to identify file ' + global.SixCRM.routes.path('config', this.stage + '/site.yml'));

		}

		return config;

	}

	setEnvironmentConfig(key, value) {

		du.debug('Set Environment Config');

		du.info(key, value);

		if (this.isValidConfiguration(key, value)) {

			return this.propagateCache('all', key, value);

		} else {

			return this.regenerateConfiguration(key);

		}

	}

	regenerateConfiguration(key) {

		du.debug('Regenerate Configuration');

		let regeneration_functions = {
			'all': () => this.regenerateAllConfigurations()
		};

		regeneration_functions[this.mandatory_config_names.redshift_host] = () => this.regenerateRedshiftConfiguration();
		regeneration_functions[this.mandatory_config_names.aurora_host] = () => this.regenerateAuroraConfiguration();
		regeneration_functions[this.mandatory_config_names.cloudsearch_domainendpoint] = () => this.regenerateCloudsearchConfiguration();

		if (key && _.isFunction(regeneration_functions[key])) {

			return regeneration_functions[key]();

		} else {

			du.warning(regeneration_functions[key] + ' is not a function.');

		}

	}

	regenerateAllConfigurations() {

		du.debug('Regenerate All Configurations');

		let promises = [
			this.regenerateRedshiftConfiguration(),
			this.regenerateCloudsearchConfiguration()
		];

		return Promise.all(promises);

	}

	regenerateRedshiftConfiguration() {
		du.debug('Regenerate Redshift Configuration');

		const redshiftprovider = new RedshiftProvider();

		let parameters = {
			ClusterIdentifier: 'sixcrm' // Technical Debt: This should not be assumed. Read from config instead.
		};

		return redshiftprovider.describeCluster(parameters).then((data) => {
			if (!objectutilities.hasRecursive(data, 'Clusters.0.Endpoint.Address')) {

				eu.throwError('server', 'Data object does not contain appropriate key: Clusters.0.Endpoint.Address');

			}

			return this.propagateCache('all', this.mandatory_config_names.redshift_host, data.Clusters[0].Endpoint.Address);
		});
	}

	regenerateAuroraConfiguration() {
		du.debug('Regenerate Aurora Configuration');

		const rdsprovider = new RDSProvider();

		let parameters = {
			DBClusterIdentifier: 'sixcrm' // Technical Debt: This should not be assumed. Read from config instead.
		};

		return rdsprovider.describeClusters(parameters).then((data) => {

			du.debug('Aurora clusters', data);

			if (!objectutilities.hasRecursive(data, 'DBClusters.0.Endpoint')) {

				eu.throwError('server', 'Data object does not contain appropriate key: DBClusters.0.Endpoint');

			}

			return this.propagateCache('all', this.mandatory_config_names.aurora_host, data.DBClusters[0].Endpoint);
		});
	}

	regenerateCloudsearchConfiguration() {

		//Technical Debt:  This is causing some issues in unit tests...
		du.debug('Regenerate Cloudsearch Configuration');

		const cloudsearchprovider = new CloudsearchProvider();

		return cloudsearchprovider.saveDomainConfiguration();

	}

	isValidConfiguration(key, value) {

		du.debug('Is Valid Configuration');

		let validation_object = {};

		validation_object[this.mandatory_config_names.redshift_host] = [
			(argument) => {
				return _.isString(argument);
			},
			(argument) => {
				return _.has(argument, 'length') && argument.length > 2;
			}
		];

		validation_object[this.mandatory_config_names.aurora_host] = [
			(argument) => {
				return _.isString(argument);
			},
			(argument) => {
				return _.has(argument, 'length') && argument.length > 2;
			}
		];

		validation_object[this.mandatory_config_names.cloudsearch_domainendpoint] = [
			(argument) => {
				return _.isString(argument);
			},
			(argument) => {
				return _.has(argument, 'length') && argument.length > 2;
			}
		];

		let validates = true;

		if (_.has(validation_object, key)) {

			arrayutilities.find(validation_object[key], (validation_function) => {
				if (validation_function(value) == false) {
					validates = false;
					return true;
				}
			});

		}

		return validates;

	}

	getEnvironmentFields() {
		//use promise all
	}

	getEnvironmentConfig(field, use_cache, wait_for) {

		du.debug('Get Environment Config');

		return new Promise((resolve) => {

			use_cache = this.setUseCache(use_cache);

			field = this.setField(field);

			wait_for = this.setWaitFor(wait_for);

			if (wait_for) {

				return this.waitForStatus(wait_for).then(() => {
					return this.getEnvironmentConfig(field, use_cache, null).then((result) => {
						return resolve(result);
					});
				});

			}

			return this.getConfiguration('local', field, use_cache)
				.then((result) => {

					if (!_.isNull(result)) {
						return resolve(result);
					}

					if (use_cache) {

						return this.getConfiguration('native', field, use_cache).then((result) => {

							if (!_.isNull(result)) {
								return resolve(result);
							}

							return this.getConfiguration('localcache', field, use_cache).then((result) => {

								if (!_.isNull(result)) {
									return resolve(result);
								}

								return this.getConfiguration('redis', field, use_cache).then((result) => {

									if (!_.isNull(result)) {
										return resolve(result);
									}

									return this.getConfiguration('s3', field, use_cache).then((result) => {

										if (_.isNull(result)) {

											return this.regenerateConfiguration(field);

										} else {

											return resolve(result);
										}

									});

								});

							});

						});

					} else {

						return this.getConfiguration('local', field, use_cache).then((result) => {

							if (!_.isNull(result)) {
								return resolve(result);
							}

							return this.getConfiguration('s3', field, use_cache).then((result) => {

								if (_.isNull(result)) {

									return this.regenerateConfiguration(field);

								} else {

									return resolve(result);

								}

							});

						});

					}

				});

		});

	}

	getConfiguration(source, field) {

		du.debug('Get Configuration');

		return new Promise((resolve) => {

			if (source == 'redis') {

				return this.getRedisEnvironmentConfiguration(field).then((result) => resolve(result));

			} else if (source == 's3') {

				return this.getS3EnvironmentConfiguration(field).then((result) => {

					return resolve(result)

				});

			} else if (source == 'native') {

				return this.getNativeEnvironmentConfiguration(field).then((result) => resolve(result));

			} else if (source == 'localcache') {

				return this.getLocalCacheEnvironmentConfiguration(field).then((result) => resolve(result));

			} else if (source == 'local') {

				return this.getLocalEnvironmentConfiguration(field).then((result) => resolve(result));

			} else {

				eu.throwError('server', 'Configuration.getConfiguration did not recognize the source provided: "' + source + '"');

			}

		});

	}

	getLocalEnvironmentConfiguration() {

		du.debug('Get Local Environent Configuration');

		let local_environment_configuration = null;

		try {

			local_environment_configuration = global.SixCRM.routes.include('config', this.stage + '/environment.yml');

		} catch (error) {

			du.warning('no local environment configuration');

		}

		return Promise.resolve(local_environment_configuration);

	}

	getNativeEnvironmentConfiguration(field) {

		du.debug('Get Native Environment Configuration');

		let result = null;

		if (field == 'all') {

			if (_.has(this, 'environment_config')) {

				result = this.environment_config;

			}

		} else if (_.has(this, 'environment_config') && _.has(this.environment_config, field)) {

			result = this.environment_config[field];

			du.highlight('Native Result: ' + result);

		}

		return Promise.resolve(result);

	}


	getLocalCacheEnvironmentConfiguration(field) {

		du.debug('Get Local Cache Environment Configuration');

		let result = null;

		if (_.has(global.SixCRM, 'localcache')) {

			let key = this.buildLocalCacheKey(field);

			result = global.SixCRM.localcache.get(key);

			du.highlight('Local Cache Result: ' + result);

		}

		this.propagateCache('native', field, result);

		return Promise.resolve(result);

	}

	getRedisEnvironmentConfiguration(field) {

		du.debug('Get Redis Environment Configuration');

		let redis_key = this.buildRedisKey(field);

		if (!_.has(this, 'redisprovider')) {
			const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');
			this.redisprovider = new RedisProvider();
		}

		return this.redisprovider.get(redis_key).then((result) => {

			this.propagateCache('localcache', field, result);

			du.highlight('Redis Cache Result: ' + result);

			return result;

		}).catch(() => {

			this.propagateCache('localcache', field, null);

			return null;

		});

	}

	getS3EnvironmentConfiguration(field) {

		du.debug('Get S3 Environment Configuration');

		let bucket = parserutilities.parse(this.config_bucket_template, {
			stage: this.stage
		});

		if (!_.has(this, 's3provider') || !_.isFunction(this.s3provider.getObject)) {

			const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
			this.s3provider = new S3Provider();

		}

		if (this.s3provider.hasCredentials(false) !== true) {
			return Promise.resolve(null);
		}

		return this.s3provider.objectExists({
			Bucket: bucket,
			Key: this.s3_environment_configuration_file_key
		}).then((exists) => {

			if (exists) {

				return this.s3provider.getObject(bucket, this.s3_environment_configuration_file_key).then((result) => {

					if (!_.has(result, 'Body')) {
						eu.throwError('server', 'Result response is assumed to have Body property');
					}

					try {

						result = JSON.parse(result.Body.toString('utf-8'));

					} catch (error) {

						eu.throwError('server', error);

					}

					let return_value = null;

					if (field == 'all') {

						return_value = result;

					} else if (_.has(result, field)) {

						return_value = result[field];

					}

					this.propagateCache('redis', field, return_value);

					return return_value;

				});

			} else {

				return this.s3provider.assureBucket({
					Bucket: bucket
				}).then(() => {

					let parameters = {
						Bucket: bucket,
						Key: this.s3_environment_configuration_file_key,
						Body: '{}'
					};

					return this.s3provider.putObject(parameters).then(() => {

						return this.getS3EnvironmentConfiguration(field);

					});

				});

			}

		});

	}

	propagateCache(source, key, value) {

		du.debug('Propagate Cache');

		if (this.stage === 'local') {
			return this.propagateToNativeCache(key, value);
		}

		if (!_.isString(source)) {
			eu.throwError('server', 'Source is assumed to be a string');
		}

		if (!_.contains(['all', 'redis', 'localcache', 'native', 's3'], source)) {
			eu.throwError('server', 'Unrecognized source destination');
		}

		if (source == 'all' || source == 's3') {

			return this.propagateToS3Cache(key, value);

		} else if (source == 'redis') {

			return this.propagateToRedisCache(key, value);

		} else if (source == 'localcache') {

			return this.propagateToLocalCache(key, value);

		} else {

			return this.propagateToNativeCache(key, value);

		}

	}

	propagateToNativeCache(key, value) {

		du.debug('Propagate To Native Cache');

		return Promise.resolve().then(() => {

			if (key == 'all') {

				if (!_.isNull(value)) {

					this.environment_config = value;

				} else {

					du.warning('Deleting Environment Config');

					delete this.environment_config;

				}


			} else {

				if (!_.has(this, 'environment_config')) {
					this.environment_config = {};
				}

				if (!_.isNull(value)) {

					this.environment_config[key] = value;

				} else {

					delete this.environment_config;

				}

			}

			return true;

		});

	}

	propagateToLocalCache(key, value) {

		du.debug('Propagate To Local Cache');

		return Promise.resolve().then(() => {

			let localcache_key = this.buildLocalCacheKey(key);

			let result = global.SixCRM.localcache.set(localcache_key, value);

			if (result) {
				return this.propagateCache('native', key, value);
			}

			eu.throwError('server', 'Unable to propagate to local cache');
			return true;
		});

	}

	propagateToRedisCache(key, value) {

		du.debug('Propagate To Redis Cache');

		if (_.isUndefined(key)) {
			eu.throwError('server', 'Key must be set');
		}

		if (_.isUndefined(value)) {
			eu.throwError('server', 'Value must be set');
		}

		if (!_.isString(value) && !objectutilities.isObject(value)) {
			return Promise.resolve(false);
		}

		return Promise.resolve().then(() => {

			let redis_key = this.buildRedisKey(key);

			if (!_.has(this, 'redisprovider')) {
				const RedisProvider = global.SixCRM.routes.include('controllers', 'providers/redis-provider.js');
				this.redisprovider = new RedisProvider();
			}

			//return this.propagateCache('localcache', key, value);

			return this.redisprovider.set(redis_key, value).then(() => {

				return this.propagateCache('localcache', key, value);

			}).catch(() => {

				return this.propagateCache('localcache', key, value);

			});

		});

	}

	propagateToS3Cache(key, value) {

		du.debug('Propagate To S3 Cache');

		return this.getS3EnvironmentConfiguration('all').then((result) => {

			du.debug('S3 environment configuration:', result);

			if (_.isNull(result)) {
				result = {};
			}

			if (_.isNull(value) && !_.has(result, key)) {

				return this.propagateCache('redis', key, value);

			} else {

				if (_.isNull(value) && _.has(result, key)) {

					delete result[key];

				} else {

					result[key] = value;

				}

				du.debug(this.config_bucket_template, {
					stage: this.stage
				});

				let bucket = parserutilities.parse(this.config_bucket_template, {
					stage: this.stage
				});

				let body = JSON.stringify(result);

				du.debug({
					Bucket: bucket,
					Key: this.s3_environment_configuration_file_key,
					Body: body
				}, process.env);

				return this.s3provider.putObject({
					Bucket: bucket,
					Key: this.s3_environment_configuration_file_key,
					Body: body
				}).then(() => {

					return this.propagateCache('redis', key, value);

				});

			}

		});

	}

}
