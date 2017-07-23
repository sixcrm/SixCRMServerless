'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
//const RedisUtilities = global.SixCRM.routes.include('lib', 'redis-utilities.js');
//const S3Utilities = global.SixCRM.routes.include('lib', 's3-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');

//Technical Debt:  Add encryption
module.exports = class Configuration {

  constructor(stage){

    this.stages = {
      '068070110666':'development',
      '821071795213':'staging',
      'abc':'production'
    }

    this.stage = this.resolveStage(stage);

    this.setEnvironmentVariable('stage', this.stage);

    this.setConfigurationFiles();

    //this.redisutilities = new RedisUtilities();

    //this.s3utilities = new S3Utilities();

    this.config_bucket_template = 'sixcrm-{{stage}}-configuration-master';

    this.s3_file_key = 'config.json';

  }

  setConfigurationFiles(){

    this.serverless_config = this.getServerlessConfig();

    this.site_config = this.getSiteConfig();

    //this.environment_config = this.getEnvironmentConfig();

  }

  setEnvironmentVariable(key, value){

    du.debug('Set Environment Variable');

    process.env[key] = value;

  }

  getServerlessConfig(){

    du.debug('Get Serverless Config');

    return global.SixCRM.routes.include('root', 'serverless.yml');

  }

  getSiteConfig(){

    du.debug('Get Site Config');

    let config = global.SixCRM.routes.include('config', this.stage+'/site.yml');

    if (!config) {

      eu.throwError('server', 'Configuration.getSiteConfig was unable to identify file '+global.SixCRM.routes.path('config', this.stage+'/site.yml'));

    }

    return config;

  }

  resolveStage(stage){

    du.debug('Resolve Stage');

    if(_.isUndefined(stage)){

      if(_.has(process.env, 'stage')){

        stage = process.env.stage;

        if(!_.contains(['local','development','staging','production'], stage)){

          eu.throwError('Configuration.resolveStage unable to validate stage name: '+stage);

        }

      }else{

        stage = this.determineStageFromAccountIdentifier();

      }

    }

    if(_.isNull(stage) || _.isUndefined(stage)){

      eu.throwError('server', 'Configuration.resolveStage unable to determine stage.');

    }

    du.critical('Stage: '+stage);

    return stage;

  }

  determineStageFromAccountIdentifier(){

    du.debug('Determine Stage From Account Identifier');

    let account_identifier = this.getAccountIdentifier();

    let stage = null

    if(!_.isNull(account_identifier)){

      if(_.has(this.stages, account_identifier)){
        return this.stages[account_identifier];
      }

      eu.throwError('server', 'Unrecognized account identifier: '+account_identifier);

    }

    return null;

  }

  getAccountIdentifier(){

    du.debug('Get Account Identifier');

    let account_identifier = this.getAccountIdentifierFromEnvironment();

    if(_.isNull(account_identifier)){

      account_identifier = this.getAccountIdentifierFromLambdaContext();

    }

    return account_identifier;

  }

  getAccountIdentifierFromEnvironment(){

    du.debug('Get Account Identifier From Environment');

    if(_.has(process.env, 'AWS_ACCOUNT')){
      return process.env.AWS_ACCOUNT;
    }

    return null;

  }

  getAccountIdentifierFromLambdaContext(){

    du.debug('Get Account Identifier From Lambda Context');

    return context.invokedFunctionArn.match(/\d{3,}/)[0];

  }

  setEnvironmentConfig(key, value){

    du.debug('Set Environment Config');

    return this.setS3EnvironmentConfig(key, value).then((result) => {

      return this.propagateToRedisCache(key, value);

      //Technical Debt: set in local

    })

  }

  setS3EnvironmentConfig(key, value){

    du.debug('Set S3 Environment Config');

    return this.getS3EnvironmentConfiguration().then((result) => {

      if(_.isNull(result)){ result = {}; }

      result[key] = value;

      let bucket = parserutilities.parse(this.config_bucket_template, {stage: this.stage});

      let body =  JSON.stringify(result);

      return this.s3utilities.putObject({Bucket:bucket, Key: this.s3_file_key, Body: body});

    })

  }

  getEnvironmentConfig(field){

    du.debug('Get Environment Config');

    return new Promise((resolve) => {

      if(_.isUndefined(field)){
        field = 'all';
      }

      //Technical Debt:  Implement local storage!
      return this.getConfiguration('redis', field).then((result) => {

        if(!_.isNull(result)){

          return resolve(result);

        }else{

          return this.getConfiguration('s3', field).then((result) => {

            if(!_.isNull(result)){

              this.propagateToRedisCache(field, result);

              return resolve(result);

            }

            return resolve(null);

          });

        }

      });

    });

  }

  propagateToRedisCache(key, value){

    du.debug('Propagate To Redis Cache');

    return this.redisutilities.set(key, value);

  }

  getConfiguration(source, field){

    du.debug('Get Configuration');

    return new Promise((resolve) => {

      if(source == 'redis'){

        return this.getRedisEnvironmentConfiguration(field).then((result) => resolve(result));

      }else if(source == 's3'){

        return this.getS3EnvironmentConfiguration(field).then((result) => resolve(result));

      }else if(source == 'local'){

        eu.throwError('server', 'Local storage not yet implemented');

      }else{

        eu.throwError('server', 'Configuration.getConfiguration did not recognize the source provided: "'+source+'"');

      }

    });

  }

  getRedisEnvironmentConfiguration(field){

    du.debug('Get Redis Environment Configuration');

    let redis_key = this.buildRedisKey(field);

    //Technical Debt: do we really need the second part of this promise?
    return this.redisutilities.get(field).then((result) => Promise.resolve(result));

  }

  buildRedisKey(field){

    du.debug('Get Redis Key');

    let prefix = parserutilities.parse(this.config_bucket_template, {stage: this.stage});

    return prefix+'-'+field;

  }

  getS3EnvironmentConfiguration(field){

    du.debug('Get S3 Environment Configuration');

    let bucket = parserutilities.parse(this.config_bucket_template, {stage: this.stage});

    return this.s3utilities.getObject({Bucket: bucket, Key: this.s3_file_key}).then((result) => {

      try{

        result = JSON.parse(result);

      }catch(error){

        eu.throwError('server', error);

      }

      if(field == 'all'){

        return result;

      }else if(_.has(result, field)){

        return result[field];

      }

      return null;

    });

  }

}
