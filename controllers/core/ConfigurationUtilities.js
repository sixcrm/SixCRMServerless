'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

module.exports = class ConfigurationUtilities {

  constructor(){

    this.stati = ['loading', 'ready'];

    this.maximum_attempts = 200;

    this.setStatus('loading');

  }

  evaluateStatus(){

    du.debug('Evaluate Status');

    if(_.has(this, 'environment_config') && _.has(this, 'site_config') && _.has(this, 'serverless_config')){

      this.setStatus('ready');

    }else{

      this.setStatus('loading');

    }

  }

  waitForStatus(status, attempt_count){

    du.debug('Wait For Status');

    if(!_.contains(this.stati, status)){
      eu.throwError('server', 'Unrecognized status');
    }

    if(_.isUndefined(attempt_count)){
      attempt_count = 0;
    }

    if(!mathutilities.isInteger(attempt_count)){
      eu.throwError('server', 'Attempt count is not an integer');
    }

    if(attempt_count < 0){
      eu.throwError('server', 'Attempt count is improper');
    }

    if(this.status == status){

      return Promise.resolve(true);

    }else{

      if(attempt_count < this.maximum_attempts){

        attempt_count++;

        du.deep('Pausing for status update ('+mathutilities.appendOrdinalSuffix(attempt_count)+' attempt)...');

        return timestamp.delay(100)().then(() => {

          return this.waitForStatus(status, attempt_count);

        });

      }else{

        eu.throwError('server', 'Maximum attempts exhausted.');

      }

    }

  }

  setStatus(status){

    du.debug('Set Status');

    if(!_.contains(this.stati, status)){
      eu.throwError('server', 'Unrecognized status');
    }

    du.highlight('Configuration status: '+status);

    this.status = status;

  }

  getStatus(){

    du.debug('Get Status');

    if(!_.has(this, 'status')){
      eu.throwError('server', 'Unset status variable.');
    }

    return this.status;

  }

  setEnvironmentVariable(key, value){

    du.debug('Set Environment Variable');

    process.env[key] = value;

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
      stage = 'local'
      //eu.throwError('server', 'Configuration.resolveStage unable to determine stage.');
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
    }else if(_.has(process.env, 'aws_account')){
      return process.env.aws_account;
    }

    return null;

  }

  getAccountIdentifierFromLambdaContext(){

    du.debug('Get Account Identifier From Lambda Context');

    if (typeof context !== 'undefined' && _.has(context, 'invokedFunctionArn')) {
      return context.invokedFunctionArn.match(/\d{3,}/)[0];
    }

    return null;

  }

  setField(field){

    if(_.isUndefined(field) || _.isNull(field)){
      field = 'all';
    }

    if(!_.isString(field)){
      eu.throwError('server', 'Configuration.setField assumes a string argument.');
    }

    return field;

  }

  setUseCache(use_cache){

    if(_.isUndefined(use_cache)){
      use_cache = true;
    }

    if(!_.isBoolean(use_cache)){
      eu.throwError('server', 'Configuration.setUseCache assumes a boolean argument.');
    }

    return use_cache;

  }

  setWaitFor(wait_for){

    if(_.isUndefined(wait_for)){
      wait_for = 'ready';
    }

    if(!_.isNull(wait_for) && !_.contains(this.stati, wait_for)){
      eu.throwError('server', 'Configuration.waitFor assumes a null or string valued argument that matches stati definitions.');
    }

    return wait_for;

  }

  buildLocalCacheKey(field){

    du.debug('Build Local Cache Key');

    return 'global.SixCRM.configuration.environment_config.'+field;

  }

  buildRedisKey(field){

    du.debug('Get Redis Key');

    return 'global.SixCRM.configuration.environment_config.'+field;

  }

}
