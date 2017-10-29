'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class Parameters {

  constructor({validation}){

    this.store = {};

    this.validation = validation;

  }

  set(key, value){

    du.debug('Set');

    if(this.validate(key, value)){

      this.store[key] = value;

    }

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

    if(_.has(this.validation, key)){

      return mvu.validateModel(value, this.validation[key], null, fatal);

    }else{

      du.warning('Missing Model: '+ key);

    }

    return true;

  }

}
