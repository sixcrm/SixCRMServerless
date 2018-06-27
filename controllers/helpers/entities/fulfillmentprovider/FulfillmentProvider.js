
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class FulfillmentProviderHelperController {

	constructor(){

		this.parameter_definition = {
			validate:{
				required:{
					fulfillmentproviderid:'fulfillment_provider_id'
				}
			}
		};

		this.parameter_validation = {
			'fulfillmentproviderid':global.SixCRM.routes.path('model','definitions/uuidv4.json'),
			'terminalresponseclass':global.SixCRM.routes.path('model','providers/shipping/terminal/responseclass.json'),
			'transformedvalidationresponse': global.SixCRM.routes.path('model','helpers/entities/fulfillmentprovider/transformedvalidationresponse.json')
		};

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	validate(){

		du.debug('Validate');

		return Promise.resolve(true)
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'validate'}))
			.then(() => this.executeValidation())
			.then(() => this.transformValidationResponse())
			.then(() => {
				return this.parameters.get('transformedvalidationresponse');
			});

	}

	executeValidation(){

		du.debug('Execute Validation');

		let fulfillment_provider_id = this.parameters.get('fulfillmentproviderid');

		const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');
		let terminalController = new TerminalController();

		return terminalController.test({fulfillment_provider_id: fulfillment_provider_id}).then(result => {

			this.parameters.set('terminalresponseclass', result);

			return true;

		});

	}

	transformValidationResponse(){

		du.debug('Transform Validation Response');

		let terminal_response_class = this.parameters.get('terminalresponseclass');

		let response_prototype = {
			code: terminal_response_class.getCode(),
			vendor_response:terminal_response_class.getVendorResponse()
		};

		this.parameters.set('transformedvalidationresponse', response_prototype);

		return true;

	}

}
