'use strict'
const _ =  require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const references_regex = /"\$ref":\s*"([0-9a-zA-Z./\-_]+?)"/g;

module.exports = class ModelBuilderUtilities {

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

        let path_to_schema = path_to_model.substring(0, path_to_model.lastIndexOf('/')) + '/' + submodel_reference;

        let submodel = this.build(path_to_schema, (depth + 1));

        model = this.replaceInstancesOfSubmodel(model, submodel_reference, submodel);

      });

    }

    return model;

  }

  static getSubmodels(model){

    let stringified_model = JSON.stringify(model);

    return stringutilities.matchGroup(stringified_model, references_regex, 1);

  }

  static replaceInstancesOfSubmodel(model, submodel_reference, submodel){

    let stringified_model = JSON.stringify(model);
    let stringified_submodel = JSON.stringify(submodel);
    let regex_reference = new RegExp('{"\\$ref":"' + submodel_reference + '"}', 'g');

    return JSON.parse(stringified_model.replace(regex_reference, stringified_submodel));
  }

};
