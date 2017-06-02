'use strict'
const _ =  require('underscore');
const Validator = require('jsonschema').Validator;

const du = global.routes.include('lib', 'debug-utilities.js');

class ModelValidatorUtilities {

    constructor(){

    }

    validateModel(object, path_to_model){

        du.debug('Validate Model');

        let v = new Validator();
        let validation;
        let schema = global.routes.include('model', path_to_model);

        this.loadAssociatedModels(schema, v);

        try{

            validation = v.validate(object, schema);

        }catch(e){

            throw new Error('Unable to instantiate validator.');

        }

        if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

            return this.issueValidationError(validation);

        }

        return this.issueValidationSuccess(validation);

    }

    loadAssociatedModels(schema, validator){

        du.debug('loadAssociatedModels');

      //Technical Debt: Finish this.
      //get associated models from the schema.
      //add them to the schema

    }

    issueValidationSuccess(validation){

        du.debug('Issue Validation Error');

        return true;

    }

    issueValidationError(validation){

        du.debug('Issue Validation Error');

        let error = {
            message: 'One or more validation errors occurred.',
            issues: validation.errors.map((e)=>{ return e.message; })
        };

        throw new Error(error.message+' '+error.issues);

    }

}

var mvu = new ModelValidatorUtilities();

module.exports = mvu;
