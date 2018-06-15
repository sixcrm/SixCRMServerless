

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

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
