'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class Parameters {

  constructor({validation, definition}){

    this.store = {};

    this.setParameterValidation({parameter_validation: validation});

    this.setParameterDefinition({parameter_definition: definition});

  }

  setParameterValidation({parameter_validation}){

    du.debug('Set Parameter Validation');

    parameter_validation = _.isUndefined(parameter_validation)?{}:parameter_validation;

    if(!_.has(this, 'parameter_validation')){
      this.parameter_validation = {};
    }

    this.parameter_validation = objectutilities.merge(this.parameter_validation, parameter_validation);

    return true;

  }

  setParameterDefinition({parameter_definition}){

    du.debug('Set Parameter Definition');

    parameter_definition = _.isUndefined(parameter_definition)?{}:parameter_definition;

    if(!_.has(this, 'parameter_definition')){
      this.parameter_definition = {};
    }

    this.parameter_definition = objectutilities.merge(this.parameter_definition, parameter_definition);

    return true;

  }

  set(key, value){

    du.debug('Set');

    if(this.validate(key, value)){

      this.store[key] = value;

    }

    return true;

  }

  getAll(){

    du.debug('Get All');

    return this.store;

  }

  get(key, additional_parameters, fatal){

    du.debug('Get');

    fatal = (_.isUndefined(fatal))?true:fatal;

    let return_object = null;

    if(_.has(this.store, key)){

      return_object = this.store[key];

      if(arrayutilities.nonEmpty(additional_parameters)){

        let missing_parameter = arrayutilities.find(additional_parameters, (additional_parameter) => {
          if(objectutilities.hasRecursive(return_object, additional_parameter)){
            return false;
          }
          return true;
        });

        if(stringutilities.isString(missing_parameter) && fatal){
          eu.throwError('server', key+' is missing "'+missing_parameter+'" property.');
        }

      }

    }

    if(_.isNull(return_object) && fatal){
      eu.throwError('server', '"'+key+'" property is not set.');
    }

    return return_object;

  }

  validate(key, value, fatal){

    du.debug('Validate');

    fatal = (_.isUndefined(fatal))?true:fatal;

    if(_.has(this.parameter_validation, key)){

      return mvu.validateModel(value, this.parameter_validation[key], null, fatal);

    }else{

      du.warning('Missing Model: '+ key);

    }

    return true;

  }

  setParameters({argumentation: argumentation, action: action}){

    du.debug('Set Parameters');

    let local_parameters = {};

    if(objectutilities.hasRecursive(this, 'parameter_definition.'+action+'.required', true)){

      local_parameters = objectutilities.transcribe(this.parameter_definition[action].required, argumentation, local_parameters, true);

    }

    if(objectutilities.hasRecursive(this, 'parameter_definition.'+action+'.optional')){

      local_parameters = objectutilities.transcribe(this.parameter_definition[action].optional, argumentation, local_parameters);

    }

    objectutilities.map(local_parameters, local_parameter => {

      this.set(local_parameter, local_parameters[local_parameter]);

    });

    return true;

  }


}
