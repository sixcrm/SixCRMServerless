const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

module.exports = class ConfigurationUtilities {

  constructor(){}

  setEnvironmentVariable(key, value){

    du.debug('Set Environment Variable');

    process.env[key] = value;

  }

  resolveStage(stage){

    du.debug('Resolve Stage');

    if(_.isUndefined(stage)){

      if(_.has(process.env, 'stage')){

        stage = process.env.stage;

        let stages = global.SixCRM.routes.include('config', 'stages.yml');

        let stage_names = objectutilities.getKeys(stages);

        stage_names.push('local'); // Technical Debt: avoid
        stage_names.push('local-docker'); // Technical Debt: avoid
        stage_names.push('circle');

        if(!_.contains(stage_names, stage)){

          eu.throwError('server', 'Configuration.resolveStage unable to validate stage name: '+stage);

        }

      }else{

        stage = this.determineStageFromBranchName();

        if(_.isNull(stage)){

          stage = this.determineStageFromAccountIdentifier();

        }

      }

    }

    if(_.isNull(stage) || _.isUndefined(stage)){
      stage = 'local'
      //eu.throwError('server', 'Configuration.resolveStage unable to determine stage.');
    }

    du.critical('Stage: '+stage);

    return stage;

  }

  determineStageFromBranchName(fatal){

    du.debug('Determine Stage From Branch Name');

    fatal = (_.isUndefined(fatal))?true:fatal;

    let branch_name = this.getBranchName();

    if(!_.isNull(branch_name)){

      let stages = global.SixCRM.routes.include('config','stages.yml');

      let identified_stage = null;

      objectutilities.map(stages, key => {
        let stage = stages[key];

        if(stage.branch_name == branch_name){
          identified_stage = key
        }
      });

      if(!_.isNull(identified_stage)){
        return identified_stage;
      }

      if(fatal){
        eu.throwError('server', 'Unrecognized branch_name in stage.yml: '+branch_name);
      }

    }

    return null;

  }

  determineStageFromAccountIdentifier(fatal){

    du.debug('Determine Stage From Account Identifier');

    fatal = (_.isUndefined(fatal))?true:fatal;

    let account_identifier = this.getAccountIdentifier();

    if(!_.isNull(account_identifier)){

      let stages = global.SixCRM.routes.include('config','stages.yml');

      let identified_stage = null;

      objectutilities.map(stages, key => {
        let stage = stages[key];

        if(stage.aws_account_id == account_identifier){
          identified_stage = key
        }
      });

      if(!_.isNull(identified_stage)){
        return identified_stage;
      }

      if(fatal){
        eu.throwError('server', 'Unrecognized account identifier in stage.yml: '+account_identifier);
      }

    }

    return null;

  }

  getAccountIdentifier(){

    du.debug('Get Account Identifier');

    return this.getAccountIdentifierFromEnvironment();

  }

  getBranchName(){

    du.debug('Get Branch Name');

    let branch_name = this.getBranchNameFromEnvironment();

    return branch_name;

  }

  getBranchNameFromEnvironment(){

    du.debug('Get Branch Name From Environment');

    if(_.has(process.env, 'CIRCLE_BRANCH')){
      return process.env.CIRCLE_BRANCH;
    }

    return null;

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

  buildLocalCacheKey(field){

    du.debug('Build Local Cache Key');

    return 'global.SixCRM.configuration.environment_config.'+field;

  }

  buildRedisKey(field){

    du.debug('Get Redis Key');

    return 'global.SixCRM.configuration.environment_config.'+field;

  }

}
