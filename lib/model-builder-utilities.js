'use strict'
const _ =  require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

module.exports = class ModelBuilderUtilities {

  //test
  static build(path_to_model, depth){

    if(_.isUndefined(depth)){
      depth = 0;
    }

    if(depth > 20){

      du.warning('Maximum depth reached:  returning empty object.');
      return {};

    }

    let model = global.SixCRM.routes.include('model', path_to_model);

    let submodel_references = this.getSubmodels(model);

    if(_.isArray(submodel_references) && submodel_references.length > 0){

      arrayutilities.map(submodel_references, (submodel_reference) => {

        let submodel = this.build(submodel_reference, (depth + 1));

        model = this.replaceInstancesOfSubmodel(model, submodel_reference, submodel);

      });

    }

    return model;

  }

  //complete
  static getSubmodels(model){

    let references_regex = /"\$ref":\s*"([0-9a-zA-Z./\-_]+?)"/g;

    let stringified_model = JSON.stringify(model);

    return stringutilities.matchAll(stringified_model, references_regex);

  }

  //complete
  static replaceInstancesOfSubmodel(model, submodel_reference, submodel){

    //replace instances of submodel_reference with submodel in model
    return model;

  }

  /*
    static loadReferencesRecursive(path_to_model, parse_function, count) {

        count || (count = 0);
        du.debug(`Load References Recursive, [${count}]`);

        if (count++ > 10) {
            du.warn('Exceeding recursive reference limit, exiting.');
            return;
        }

        du.debug(`Looking for references in ${path_to_model}`);
        let schema = require(path_to_model);
        // du.debug(schema);

        let references_regex = /"\$ref":\s*"([0-9a-zA-Z./\-_]+?)"/g;
        let references = this.getMatches(JSON.stringify(schema), references_regex, 1);

        du.debug(`Found ${references.length} reference(s).`);

        references.forEach((reference) => {
            du.output(`Found reference to ${reference}`);
            let uri = reference;
            let path_to_schema = `${path_to_model.substring(0, path_to_model.lastIndexOf('/'))}/${uri}`;
            let schema = require(path_to_schema);

            parse_function(schema, uri);

            this.loadReferencesRecursive(path_to_schema, parse_function, count);

        });

    }
    */

}
