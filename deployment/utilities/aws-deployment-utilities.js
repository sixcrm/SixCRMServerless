'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const configurationutilities = global.routes.include('lib', 'configuration-utilities.js');
const objectutilities = global.routes.include('lib', 'object-utilities.js');
//const arrayutilities = global.routes.include('lib', 'array-utilities.js');

module.exports = class AWSDeploymentUtilities {

  constructor(stage) {

    this.stage = configurationutilities.resolveStage(stage);

    process.env.stage = this.stage;

    this.site_config = configurationutilities.getSiteConfig(this.stage);

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
