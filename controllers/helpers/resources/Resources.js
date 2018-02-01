'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const Parameters  = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class ResourceUtilities {

  constructor(){

    this.parameter_validation = {};

    this.parameter_definition = {};

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_defintion});

  }

  augmentParameters(){

    du.debug('Augment Parameters');

    this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
    this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

    return true;

  }

  getContentType(event){

		let contentType = event.headers['content-type'];

		if (!contentType) {
			return event.headers['Content-Type'];
		}
		return contentType;

	}


}
