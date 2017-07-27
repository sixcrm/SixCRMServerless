'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const ConfigurationUtilities = global.SixCRM.routes.include('controllers', 'core/ConfigurationUtilities.js');

module.exports = class Configuration extends ConfigurationUtilities {

  constructor(stage) {

    super(stage);

    this.setConfigurationInformation();

    this.handleStage(stage);

    this.setConfigurationFiles();

  }

  setConfigurationInformation() {

    this.stages = {
      '068070110666': 'development',
      '821071795213': 'staging',
      'abc': 'production'
    }

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

    return this.getEnvironmentConfig(null, false).then((result) => {

      this.environment_config = result;

      this.evaluateStatus();

    });

  }

  getServerlessConfig() {

    du.debug('Get Serverless Config');

    return global.SixCRM.routes.include('root', 'serverless-config.yml');

  }

  getSiteConfig() {

    du.debug('Get Site Config');

    let config = global.SixCRM.routes.include('config', this.stage + '/site.yml');

    if (!config) {

      eu.throwError('server', 'Configuration.getSiteConfig was unable to identify file ' + global.SixCRM.routes.path('config', this.stage + '/site.yml'));

    }

    return config;

  }

  setEnvironmentConfig(key, value) {

    du.debug('Set Environment Config');

    return this.propagateCache('all', key, value);

  }

  getEnvironmentFields(array) {
    //use promise all
  }

  getEnvironmentConfig(field, use_cache) {

    du.debug('Get Environment Config');

    return new Promise((resolve) => {

      use_cache = this.setUseCache(use_cache);

      field = this.setField(field);

      if (use_cache) {

        return this.getConfiguration('local', field, use_cache).then((result) => {

          if (!_.isNull(result)) {
            return resolve(result);
          }

          return this.getConfiguration('redis', field, use_cache).then((result) => {

            if (!_.isNull(result)) {
              return resolve(result);
            }

            return this.getConfiguration('s3', field, use_cache).then((result) => {

              return resolve(result);

            });

          });

        });

      } else {

        return this.getConfiguration('s3', field, use_cache).then((result) => {

          return resolve(result);

        });

      }

    });

  }

  getConfiguration(source, field, use_cache) {

    du.debug('Get Configuration');

    return new Promise((resolve) => {

      if (source == 'redis') {

        return this.getRedisEnvironmentConfiguration(field).then((result) => resolve(result));

      } else if (source == 's3') {

        return this.getS3EnvironmentConfiguration(field).then((result) => resolve(result));

      } else if (source == 'local') {

        return this.getLocalEnvironmentConfiguration(field).then((result) => resolve(result));

      } else {

        eu.throwError('server', 'Configuration.getConfiguration did not recognize the source provided: "' + source + '"');

      }

    });

  }

  getLocalEnvironmentConfiguration(field) {

    du.debug('Get Local Environment Configuration');

    let result = null;

    if (_.has(global.SixCRM, 'localcache')) {

      let key = this.buildLocalCacheKey(field);

      result = global.SixCRM.localcache.get(key);

    }

    return Promise.resolve(result);

  }

  getRedisEnvironmentConfiguration(field) {

    du.debug('Get Redis Environment Configuration');

    du.warning('Redis disabled');

    return Promise.resolve(null);

    /*
    let redis_key = this.buildRedisKey(field);

    if(!_.has(this, 'redisutilities')){
      this.redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');
    }

    return this.redisutilities.get(redis_key).then((result) => {

      du.warning(result); process.exit();

    });
    */

  }

  getS3EnvironmentConfiguration(field) {

    du.debug('Get S3 Environment Configuration');

    let bucket = parserutilities.parse(this.config_bucket_template, {
      stage: this.stage
    });

    if (!_.has(this, 's3utilities') || !_.isFunction(this.s3utilities.getObject)) {

      this.s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

    }

    let parameters = {
      Bucket: bucket,
      Key: this.s3_environment_configuration_file_key
    };

    return this.s3utilities.objectExists(parameters).then((result) => {
      if (result) {
        return bucket
      } else {
        parameters.Body = '{}'
        return this.s3utilities.putObject(parameters);
      }

    }).then((bucket) => {
      return this.s3utilities.getObject(bucket, this.s3_environment_configuration_file_key).then((result) => {

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

          return_value = field;

        } else if (_.has(result, field)) {

          return_value = result[field];

        }

        this.propagateCache('redis', field, return_value);

        return return_value;

      });
    });

  }

  propagateCache(source, key, value) {

    if (_.isUndefined(source) || _.isNull(source)) {
      source = 'all';
    }

    if (!_.isString(source)) {
      eu.throwError('server', 'Source is assumed to be a string');
    }

    if (!_.contains(['all', 'redis', 'localcache', 's3'], source)) {
      eu.throwError('server', 'Unrecognized source destination');
    }

    if (source == 'all' || source == 's3') {

      return this.propagateToS3Cache(key, value);

    } else if (source == 'redis') {

      return this.propagateToRedisCache(key, value);

    } else {

      return this.propagateToLocalCache(key, value);

    }

  }

  propagateToLocalCache(key, value) {

    du.debug('Propagate To Local Cache');

    return Promise.resolve().then(() => {

      let localcache_key = this.buildLocalCacheKey(key);

      let result = global.SixCRM.localcache.set(localcache_key, value);

      if (result) {

        return result;

      }

      eu.throwError('server', 'Unable to propagate to local cache');

    });

  }

  propagateToRedisCache(key, value) {

    du.debug('Propagate To Redis Cache');

    return Promise.resolve().then(() => {

      du.warning('Redis disabled');

      return this.propagateCache('localcache', key, value);

    });

  }

  propagateToS3Cache(key, value) {

    du.debug('Propagate To S3 Cache');

    return this.getS3EnvironmentConfiguration('all').then((result) => {

      if (_.isNull(result)) {
        result = {};
      }

      if (_.isNull(value) && !_.has(result, key)) {

        return this.propagateCache('redis', key, value);

      } else {

        if (_.isNull(value)) {

          delete result[key];

        } else {

          result[key] = value;

        }

        let bucket = parserutilities.parse(this.config_bucket_template, {
          stage: this.stage
        });

        let body = JSON.stringify(result);

        return this.s3utilities.putObject({
          Bucket: bucket,
          Key: this.s3_environment_configuration_file_key,
          Body: body
        }).then((result) => {

          return this.propagateCache('redis', key, value);

        });

      }

    });

  }

}
