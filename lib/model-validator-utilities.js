'use strict'
const _ =  require('underscore');
const Validator = require('jsonschema').Validator;

const du = global.routes.include('lib', 'debug-utilities.js');

module.exports = class ModelValidatorUtilities {

    static validationFunction(object, path_to_model){

        du.debug('Validate Function');

        let v = new Validator();

        let schema = require(path_to_model);

        //this.loadAssociatedModels(schema, v);

        let validation;

        try{

            validation = v.validate(object, schema);

        }catch(e){

            throw new Error('Unable to instantiate validator.');

        }

        return validation;

    }

    static validateModel(validation_object, path_to_model, validation_function){

        du.debug('Validate Model');

        du.deep('Validation Object: ', validation_object);

        du.deep('Validation Model: '+path_to_model);

        let validation;

        if(_.isUndefined(validation_function)){

            validation_function = () => { return this.validationFunction(validation_object, path_to_model); }

        }else{

            if(!_.isFunction(validation_function)){

                throw new Error('Validation function is not a function.');

            }

        }

        validation = validation_function();

        if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

            du.warning(validation);

            return this.issueValidationError(validation);

        }

        return this.issueValidationSuccess(validation);

    }

    //Technical Debt: Finish this.
    /*
    static loadAssociatedModels(schema, validator){

        du.debug('loadAssociatedModels');

      //Technical Debt: Finish this.
      //get associated models from the schema.
      //add them to the schema

    }
    */

    static issueValidationSuccess(){

        du.debug('Issue Validation Success.');

        du.highlight('Model is valid.');

        return true;

    }

    static issueValidationError(validation){

        du.debug('Issue Validation Error');

        du.highlight('Model is not valid.');

        let error = {
            message: 'One or more validation errors occurred.',
            issues: validation.errors.map((e)=>{ return e.stack; })
        };

        throw new Error(error.message+' '+error.issues);

    }

}
