'use strict'
const _ =  require('underscore');
const Validator = require('jsonschema').Validator;

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

module.exports = class ModelValidatorUtilities {

    static validationFunction(object, path_to_model){

        du.debug('Validate Function');

        let v = new Validator();

        let schema = require(path_to_model);

        //this.loadAssociatedModels(schema, v);

        let validation;

        try{

          this.loadReferencesRecursive(path_to_model, (schema, uri) => {

            this.ensureCorrectId(schema, uri);

            v.addSchema(schema, this.getCorrectPath(uri));

          });

          validation = v.validate(object, schema);

        }catch(e){

          du.error(e);

          eu.throwError('server','Unable to instantiate validator.');

        }

        return validation;

    }

    static loadReferencesRecursive(path_to_model, parse_function, count) {

        count || (count = 0);
        du.debug(`Load References Recursive, [${count}]`);

        if (count++ > 10) {
            du.warning('Exceeding recursive reference limit, exiting.');
            return;
        }

        du.debug(`Looking for references in ${path_to_model}`);
        let schema = require(path_to_model);
        //du.debug(schema);

        let references_regex = /"\$ref":\s*"([0-9a-zA-Z./\-_]+?)"/g;
        let references = this.getMatches(JSON.stringify(schema), references_regex, 1);

        du.debug(`Found ${references.length} reference(s).`);

        arrayutilities.map(references, (reference) => {

          du.output(`Found reference to ${reference}`);

          let uri = reference;
          let path_to_schema = `${path_to_model.substring(0, path_to_model.lastIndexOf('/'))}/${uri}`;
          let schema = require(path_to_schema);

          parse_function(schema, uri);

          this.loadReferencesRecursive(path_to_schema, parse_function, count);

        });

    }

    //Technical Debt:  This belong in the /lib directory
    static getMatches(string, regex, index) {
        index || (index = 1);
        let matches = [];
        let match;

        do {
            match = regex.exec(string);
            if (match) {
                matches.push(match[index]);
            }
        } while (match);

        return matches;
    }

    static validateModel(validation_object, path_to_model, validation_function, fatal){

        du.debug('Validate Model');

        if(_.isUndefined(validation_object)){
          eu.throwError('server', 'Validation object must be defined.');
        }

        if(_.isUndefined(fatal)){
          fatal = true;
        }

        du.deep('Validation Object: ', validation_object);

        du.deep('Validation Model: '+path_to_model);

        let validation;

        if(_.isUndefined(validation_function) || _.isNull(validation_function)){

            validation_function = () => { return this.validationFunction(validation_object, path_to_model); }

        }else{

            if(!_.isFunction(validation_function)){

              eu.throwError('server','Validation function is not a function.');

            }

        }

        validation = validation_function();

        if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

          du.deep(validation);

          if(fatal){

            return this.issueValidationError(validation);

          }else{

            return false;

          }

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

    /**
     * Alter the id of schema if needed.
     *
     * Schema validation library that we use requires that id of the schema is in correlation to it's path at the time
     * of loading. This method ensures that.
     *
     * @param schema Schema object
     * @param path   Path to schema.
     */
    static ensureCorrectId(schema, path) {

        let canonical_id = path.replace(/\.+\//g,'/').replace(/\/\/+/g,'/'); //remove relative paths

        if (canonical_id.length > schema.id.length) {
            schema.id = canonical_id;
        }

        if (path[0] === '.' && path[1] !== '.') {
            path = path.substr(1);
        }

    }

    static getCorrectPath(path) {
        if (path[0] === '.' && path[1] !== '.') { // No need for paths to start with dot when referencing a file in same directory.
            return path.substr(1);                // Technical Debt: figure out why this causes problems.
        }

        return path;
    }

    static issueValidationSuccess(){

        du.debug('Issue Validation Success.');

        du.highlight('Model is valid.');

        return true;

    }

    static issueValidationError(validation){

        du.debug('Issue Validation Error');

        du.highlight('Model is not valid.');

        du.warning(validation);

        eu.throwError(
          'server',
          'One or more validation errors occurred: '+this.buildPrettyErrorMessage(validation),
          {issues: validation.errors.map((e)=>{ return e.stack; })}
        );

    }

    static buildPrettyErrorMessage(validation){

      let error_messages = [];

      arrayutilities.map(validation.errors, validation_error => {
        if(objectutilities.hasRecursive(validation, 'schema.title') && _.has(validation_error, 'stack')){
          error_messages.push(validation.schema.title+' '+validation_error.stack);
        }
      })

      return arrayutilities.compress(error_messages,', ','');

    }

}
