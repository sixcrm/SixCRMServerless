'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const ConfigurationUtilities = global.SixCRM.routes.include('controllers', 'core/ConfigurationUtilities.js');

module.exports = class Configuration extends ConfigurationUtilities {

  constructor(stage){

    super();

    this.setConfigurationInformation();

    this.handleStage(stage);

    this.setConfigurationFiles();

    this.mandatory_config_names = {
      redshift_host: 'redshift.host',
      cloudsearch_domainendpoint: 'cloudsearch.domainendpoint'
    }

  }

  setConfigurationInformation(){

    this.stages = {
      '068070110666':'development',
      '821071795213':'staging',
      '181111172466':'production'
    }

    this.config_bucket_template = 'sixcrm-{{stage}}-configuration-master';

    this.s3_environment_configuration_file_key = 'config.json';

  }

  handleStage(stage){

    du.debug('Handle Stage');

    this.stage = this.resolveStage(stage);

    this.setEnvironmentVariable('stage', this.stage);

  }

  setConfigurationFiles(){

    du.debug('Set Configuration Files');

    this.serverless_config = this.getServerlessConfig();

    this.site_config = this.getSiteConfig();

    this.evaluateStatus();

  }

  setEnvironmentConfigurationFile(){

    du.debug('Set Environment Configuration Files');

    return this.getEnvironmentConfig(null, false, null).then((result) => {

      this.environment_config = result;

      this.evaluateStatus();

      return;

    });

  }

  //Technical Debt: Note that it will need to parse the references included therein...
  getServerlessConfig(){

    du.debug('Get Serverless Config');

    return global.SixCRM.routes.include('root', 'serverless.yml');

  }

  getSiteConfig(){

    du.debug('Get Site Config');

    let config;

    try {

      config = global.SixCRM.routes.include('config', this.stage + '/site.yml');

    } catch (error) {

      eu.throwError('server', 'Configuration.getSiteConfig was unable to identify file '+global.SixCRM.routes.path('config', this.stage+'/site.yml'));

    }

    return config;

  }

  setEnvironmentConfig(key, value){

    du.debug('Set Environment Config');

    if(this.isValidConfiguration(key, value)){

      return this.propagateCache('all', key, value);

    } else {

      return this.regenerateConfiguration(key);

    }

  }

  regenerateConfiguration(key) {

    let regeneration_functions = {};

    regeneration_functions[this.mandatory_config_names.redshift_host] = () => this.regenerateRedshiftConfiguration();
    regeneration_functions[this.mandatory_config_names.cloudsearch_domainendpoint] = () => this.regenerateCloudsearchConfiguration();

    return regeneration_functions[key]();
  }

  regenerateRedshiftConfiguration() {
      du.debug('Regenerate Redshift Configuration');

      const redshiftutilities = global.SixCRM.routes.include('lib', 'redshift-utilities.js');

      let parameters = {
        ClusterIdentifier: 'sixcrm' // Technical Debt: This should not be assumed. Read from config instead.
      };

      return redshiftutilities.describeCluster(parameters).then((data) => {
          if(!objectutilities.hasRecursive(data, 'Clusters.0.Endpoint.Address')){

              eu.throwError('server', 'Data object does not contain appropriate key: Clusters.0.Endpoint.Address');

          }

          return this.propagateCache('all', this.mandatory_config_names.redshift_host, data.Clusters[0].Endpoint.Address);
      });
  }

    regenerateCloudsearchConfiguration() {
        du.debug('Regenerate Cloudsearch Configuration');

        const cloudsearchutilities = global.SixCRM.routes.include('lib', 'cloudsearch-utilities.js');

        return cloudsearchutilities.saveDomainConfiguration();
    }

  isValidConfiguration(key, value){

    du.debug('Is Valid Configuration');

    let validation_object = {};

    validation_object[this.mandatory_config_names.redshift_host] = [
        (argument) => { return _.isString(argument); },
        (argument) => { return _.has(argument, 'length') && argument.length > 2; }
      ];

    validation_object[this.mandatory_config_names.cloudsearch_domainendpoint] = [
      (argument) => { return _.isString(argument); },
      (argument) => { return _.has(argument, 'length') && argument.length > 2; }
    ];

    let validates = true;

    if(_.has(validation_object, key)){

      arrayutilities.find(validation_object[key], (validation_function) => {
        if(validation_function(value) == false){
          validates = false;
          return true;
        }
      });

    }

    return validates;

  }

  getEnvironmentFields(array){
    //use promise all
  }

  getEnvironmentConfig(field, use_cache, wait_for){

    du.debug('Get Environment Config');

    return new Promise((resolve) => {

      use_cache = this.setUseCache(use_cache);

      field = this.setField(field);

      wait_for = this.setWaitFor(wait_for);

      if(wait_for){

        return this.waitForStatus(wait_for).then(() => {
          return this.getEnvironmentConfig(field, use_cache, null).then((result) => {
              return resolve(result);
          });
        });

      }

      if(use_cache){

        return this.getConfiguration('native', field, use_cache).then((result) => {

          if(!_.isNull(result)){ return resolve(result); }

          return this.getConfiguration('localcache', field, use_cache).then((result) => {

            if(!_.isNull(result)){ return resolve(result); }

            return this.getConfiguration('redis', field, use_cache).then((result) => {

              if(!_.isNull(result)){ return resolve(result); }

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

      }else{

        return this.getConfiguration('s3', field, use_cache).then((result) => {

            if (_.isNull(result)) {

                return this.regenerateConfiguration(field);

            } else {

                return resolve(result);
            }

        });

      }

    });

  }

  getConfiguration(source, field, use_cache){

    du.debug('Get Configuration');

    return new Promise((resolve) => {

      if(source == 'redis'){

        return this.getRedisEnvironmentConfiguration(field).then((result) => resolve(result));

      }else if(source == 's3'){

        return this.getS3EnvironmentConfiguration(field).then((result) => {

          return resolve(result)

        });

      }else if(source == 'native'){

        return this.getNativeEnvironmentConfiguration(field).then((result) => resolve(result));

      }else if(source == 'localcache'){

        return this.getLocalEnvironmentConfiguration(field).then((result) => resolve(result));

      }else{

        eu.throwError('server', 'Configuration.getConfiguration did not recognize the source provided: "'+source+'"');

      }

    });

  }

  getNativeEnvironmentConfiguration(field){

    du.debug('Get Native Environment Configuration');

    let result = null;

    if(field == 'all'){

      if(_.has(this, 'environment_config')){

        result = this.environment_config;

      }

    }else if(_.has(this, 'environment_config') && _.has(this.environment_config, field)){

      result = this.environment_config[field];

      du.highlight('Native Result: '+result);

    }

    return Promise.resolve(result);

  }


  getLocalEnvironmentConfiguration(field){

    du.debug('Get Local Environment Configuration');

    let result = null;

    if(_.has(global.SixCRM, 'localcache')){

      let key = this.buildLocalCacheKey(field);

      result = global.SixCRM.localcache.get(key);

      du.highlight('Local Cache Result: '+result);

    }

    this.propagateCache('native', field, result);

    return Promise.resolve(result);

  }

  getRedisEnvironmentConfiguration(field){

    du.debug('Get Redis Environment Configuration');

    let redis_key = this.buildRedisKey(field);

    if(!_.has(this, 'redisutilities')){
      this.redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');
    }

    return this.redisutilities.get(redis_key).then((result) => {

      this.propagateCache('localcache', field, result);

      du.highlight('Redis Cache Result: '+result);

      return result;

    }).catch((error) => {

      this.propagateCache('localcache', field, null);

      return null;

    });

  }

  getS3EnvironmentConfiguration(field){

    du.debug('Get S3 Environment Configuration');

    let bucket = parserutilities.parse(this.config_bucket_template, {stage: this.stage});

    if(!_.has(this, 's3utilities') || !_.isFunction(this.s3utilities.getObject)){

      this.s3utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');

    }

    return this.s3utilities.objectExists({Bucket: bucket, Key: this.s3_environment_configuration_file_key}).then((exists) => {

      if(exists){

          return this.s3utilities.getObject(bucket, this.s3_environment_configuration_file_key).then((result) => {

            if(!_.has(result, 'Body')){
              eu.throwError('server', 'Result response is assumed to have Body property');
            }

            try{

              result = JSON.parse(result.Body.toString('utf-8'));

            }catch(error){

              eu.throwError('server', error);

            }

            let return_value = null;

            if(field == 'all'){

              return_value = result;

            }else if(_.has(result, field)){

              return_value = result[field];

            }

            this.propagateCache('redis', field, return_value);

            return return_value;

          });

      }else{

        return this.s3utilities.assureBucket(bucket).then(() => {

          let parameters = {
            Bucket: bucket,
            Key: this.s3_environment_configuration_file_key,
            Body: '{}'
          };

          return this.s3utilities.putObject(parameters).then((result) => {

            //du.warning(result);

            return this.getS3EnvironmentConfiguration(field);

          });

        });

      }

    });

  }

  propagateCache(source, key, value){

    du.debug('Propagate Cache');

    if (this.stage === 'local') {
        return this.propagateToNativeCache(key, value);
    }

    if(!_.isString(source)){
      eu.throwError('server', 'Source is assumed to be a string');
    }

    if(!_.contains(['all', 'redis', 'localcache', 'native', 's3'], source)){
      eu.throwError('server', 'Unrecognized source destination');
    }

    if(source == 'all' || source == 's3'){

      return this.propagateToS3Cache(key, value);

    }else if(source == 'redis'){

      return this.propagateToRedisCache(key, value);

    }else if(source == 'localcache'){

      return this.propagateToLocalCache(key, value);

    }else{

      return this.propagateToNativeCache(key, value);

    }

  }

  propagateToNativeCache(key, value){

    du.debug('Propagate To Native Cache');

    return Promise.resolve().then(() => {

      if(key == 'all'){

        if(!_.isNull(value)){

          this.environment_config = value;

        }else{

          du.warning('Deleting Environment Config');

          delete this.environment_config;

        }


      }else{

        if(!_.has(this, 'environment_config')){
          this.environment_config = {};
        }

        if(!_.isNull(value)){

          this.environment_config[key] = value;

        }else{

          delete this.environment_config;

        }

      }

      return true;

    });

  }

  propagateToLocalCache(key, value){

    du.debug('Propagate To Local Cache');

    return Promise.resolve().then(() => {

      let localcache_key = this.buildLocalCacheKey(key);

      let result = global.SixCRM.localcache.set(localcache_key, value);

      if(result){
        return this.propagateCache('native', key, value);
      }

      eu.throwError('server', 'Unable to propagate to local cache');

    });

  }

  propagateToRedisCache(key, value){

    du.debug('Propagate To Redis Cache');

    if(_.isUndefined(key)){
      eu.throwError('server', 'Key must be set');
    }

    if(_.isUndefined(value)){
      eu.throwError('server', 'Value must be set');
    }

    if(!_.isString(value) && !objectutilities.isObject(value)){
      return Promise.resolve(false);
    }

    return Promise.resolve().then(() => {

      let redis_key = this.buildRedisKey(key);

      if(!_.has(this, 'redisutilities')){
        this.redisutilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');
      }

      //return this.propagateCache('localcache', key, value);

      return this.redisutilities.set(redis_key, value).then((result) => {

        return this.propagateCache('localcache', key, value);

      }).catch((error) => {

        return this.propagateCache('localcache', key, value);

      });

    });

  }

  propagateToS3Cache(key, value){

    du.debug('Propagate To S3 Cache');

    return this.getS3EnvironmentConfiguration('all').then((result) => {

      if(_.isNull(result)){ result = {}; }

      if(_.isNull(value) && !_.has(result, key)){

        return this.propagateCache('redis', key, value);

      }else{

        if(_.isNull(value)){

          delete result[key];

        }else{

          result[key] = value;

        }

        let bucket = parserutilities.parse(this.config_bucket_template, {stage: this.stage});

        let body =  JSON.stringify(result);

        return this.s3utilities.putObject({Bucket:bucket, Key: this.s3_environment_configuration_file_key, Body: body}).then((result) => {

          return this.propagateCache('redis', key, value);

        });

      }

    });

  }

}
