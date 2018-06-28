
const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const ResponseController = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class ShippingCarrierResponse extends ResponseController {

	constructor(){

		super();

		this.parameter_validation = {
			'action':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/action.json'),
			'vendorresponse':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/response/vendorresponse.json'),
			'additionalparameters':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/response/additionalparameters.json'),
			'detail':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/response/detail.json'),
			'status':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/response/status.json'),
			'parsedresponse':global.SixCRM.routes.path('model', 'vendors/shippingcarriers/response/parsedresponse.json')
		};

		this.parameter_definition = {
			'constructor':{
				required:{
					vendorresponse:'vendor_response',
					action:'action'
				},
				optional:{
					additionalparameters: 'additional_parameters'
				}
			}
		};

		this.result_messages = {
			'success':'Success',
			'fail': 'Failed',
			'error': 'Error'
		};

		this.initialize();

		this.parameters.setParameters({argumentation: arguments[0], action: 'constructor'});

	}

	augmentParameters(){

		du.debug('Augment Parameters');

		this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
		this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

		return true;

	}

	infoResponse(){

		du.debug('Info Response');

		let parsed_response = {
			tracking_number: this.parameters.get('trackingnumber'),
			status: this.parameters.get('status'),
			detail: this.parameters.get('detail')
		};

		this.setParsedResponse(parsed_response);

		this.setResponse('success');
		this.setMessage(this.determineResultMessage('success'));

	}

	determineResultMessage(response_type){

		du.debug('Determine Result Message');

		if(_.has(this.result_messages, response_type)){
			return this.result_messages[response_type];
		}

		throw eu.getError('server', 'Unknow response type: '+response_type);

	}

	setParsedResponse(parsed_response){

		du.debug('Set Parsed Response');

		this.parameters.set('parsedresponse', parsed_response);

		return true;

	}

	getParsedResponse(){

		du.debug('Get Parsed Response');

		return this.parameters.get('parsedresponse', {fatal: false});

	}

}
