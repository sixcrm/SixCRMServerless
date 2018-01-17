'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

module.exports = class AWSDeploymentUtilities {

  constructor(){

    this.stsutilities = global.SixCRM.routes.include('lib', 'sts-utilities.js');

  }

  setRole(environment_key){

    du.debug('Set Role');

    let assume_role_parameters = this.getEnvironmentAssumedRoleParameters(environment_key);

    return this.stsutilities.assumeRole(assume_role_parameters).then(result => {

      return this.setAssumedRoleProperties(result);

    });

  }

  setAssumedRoleProperties(assumed_role_json){

    du.debug('Set Assumed Role Properties');

    mvu.validateModel(assumed_role_json, global.SixCRM.routes.path('model', 'deployment/sts/assumedroleresponse.json'));

    process.env.AWS_ACCESS_KEY_ID = assumed_role_json.Credentials.AccessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = assumed_role_json.Credentials.SecretAccessKey;
    process.env.AWS_SESSION_TOKEN = assumed_role_json.Credentials.SessionToken;

    return true;

  }

  getEnvironmentAssumedRoleParameters(environment_key){

    let environments_json = global.SixCRM.routes.include('deployment', 'sts/config/accounts.json');

    du.info(environments_json, environment_key);

    if(!_.has(environments_json.deployment_accounts, environment_key)){
      eu.throwError('server', 'Unknown deployment environment: '+environment_key);
    }

    let account_id = environments_json.deployment_accounts[environment_key].account_id;
    let role_name = global.SixCRM.configuration.site_config.sts.deployment_role_name;
    let external_id = environments_json.deployment_accounts[environment_key].external_id;

    return {
      RoleArn:'arn:aws:iam::'+account_id+':role/'+role_name,
      ExternalId: external_id
    };

  }

  createParameterGroup(action, subaction, object){

    du.deep('Create Parameter Group');

    if(!_.has(this.parameter_groups, action)){
      eu.throwError('server', 'AWSDeploymentUtilities.createParameterGroup assumes parameter group has action property.');
    }
    if(!_.isNull(subaction)){
      if(!_.has(this.parameter_groups[action], subaction)){
        eu.throwError('server', 'AWSDeploymentUtilities.createParameterGroup assumes parameter group action has property subaction.');
      }
      if(!_.has(this.parameter_groups[action][subaction], 'required')){
        eu.throwError('server', 'AWSDeploymentUtilities.createParameterGroup assumes parameter group action.subaction has property required.');
      }
    }else{
      if(!_.has(this.parameter_groups[action], 'required')){
        eu.throwError('server', 'AWSDeploymentUtilities.createParameterGroup assumes parameter group action has property required.');
      }
    }

    let action_settings = {};

    if(_.isNull(subaction)){
      action_settings = this.parameter_groups[action];
    }else{
      action_settings = this.parameter_groups[action][subaction];
    }

    let required_parameters = objectutilities.additiveFilter(action_settings.required, object);

    let optional_parameters = {};

    if(_.has(action_settings, 'optional')){

      optional_parameters = objectutilities.additiveFilter(action_settings.optional, object);

    }

    let merged = objectutilities.merge(required_parameters, optional_parameters);

    return merged;

  }

}
