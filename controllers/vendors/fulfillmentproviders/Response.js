
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const Response = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class FulfillmentProviderVendorResponse extends Response {

	constructor(){

		super();

		this.parameter_definition = {
			handleResponse:{
				required: {
					vendorresponse:'vendor_response',
					action:'action'
				},
				optional:{
					additionalparameters: 'additional_parameters'
				}
			}
		};

		this.parameter_validation = {
			'vendorresponse':global.SixCRM.routes.path('model','vendors/shippingcarriers/response/vendorresponse.json'),
			'action':global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/action.json'),
			'additionalparameters': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/response/additionalparameters.json'),
			//Technical Debt:  Bad Paths...
			'code': global.SixCRM.routes.path('model','vendors/shippingproviders/response/code.json'),
			'result': global.SixCRM.routes.path('model','vendors/shippingproviders/response/result.json'),
			'message': global.SixCRM.routes.path('model','vendors/shippingproviders/response/message.json'),
			'parsedresponse':global.SixCRM.routes.path('model','vendors/fulfillmentproviders/response/parsedresponse.json')
		};

		this.result_messages = {
			'success':'Success',
			'fail': 'Failed',
			'error': 'Error'
		};

		this.initialize();

		this.handleResponse(arguments[0]);

	}

	augmentParameters(){

		du.debug('Augment Parameters');

		this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
		this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

		return true;

	}

	getFulfillmentProviderName(){

		du.debug('Get Fulfillment Provider Name');

		return objectutilities.getClassName(this).replace('Response', '');

	}

	handleResponse(){

		du.debug('Handle Response');

		this.parameters.setParameters({argumentation: arguments[0], action: 'handleResponse'});

		let error = this.parameters.get('error', false);

		if(!_.isNull(error)){

			this.handleError(error);

		}else{

			if(_.isFunction(this.determineResultCode)){

				let vendor_response = this.parameters.get('vendorresponse');
				let response = vendor_response.response;
				let body = vendor_response.body;

				this.parameters.set('response', response);
				this.parameters.set('body', body);

				this.validateVendorResponse();

				let result_code = this.determineResultCode({response: response, body: body});
				let result_message = this.determineResultMessage(result_code);

				if(_.isFunction(this.translateResponse)){

					let parsed_response = this.translateResponse(response);

					if(!_.isNull(parsed_response)){
						this.parameters.set('parsedresponse', parsed_response);
					}

				}

				this.setCode(result_code);
				this.setMessage(result_message);

			}

		}

	}

	getParsedResponse(){

		du.debug('Get Parsed Response');

		return this.parameters.get('parsedresponse', false);

	}

	setResponse(response){

		du.debug('Set Response');

		this.parameters.set('response', response);

	}

	setAllProperties({code, message}){

		du.debug('Set All Properties');

		this.setCode(code);

		this.setMessage(message);

		//this.setResponse(response);

	}

	determineResultCode({response: response}){

		du.debug('Determine Result');

		if(_.has(response, 'statusCode')){

			if(response.statusCode == 200){

				return 'success';

			}

			return 'fail';

		}

		return 'error';

	}

	determineResultMessage(result_code){

		du.debug('Determine Result Message');

		return this.result_messages[result_code];

	}

	validateVendorResponse(){

		du.debug('Validate Provider Response');

		let fulfillment_provider_name = this.getFulfillmentProviderName();
		let response = this.parameters.get('response');

		mvu.validateModel(response, global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/'+fulfillment_provider_name+'/response.json'));

		return true;

	}

	handleError(error){

		du.debug('Handle Error');

		this.setCode('error');

		if(_.has(error, 'message')){
			this.setMessage(error.message);
		}else{
			this.setMessage(this.determineResultMessage('error'));
		}

	}

	getResult(){

		du.debug('Get Result');

		return {
			code: this.getCode(),
			response: this.getResponse(),
			message: this.getMessage()
		};

	}

	getResponse(){

		du.debug('Get Response');

		return this.parameters.get('response', false);

	}

	setMessage(message){

		du.debug('Set Message');

		this.parameters.set('message', message);

		return true;

	}

	getMessage(){

		du.debug('Get Message');

		return this.parameters.get('message')

	}

	setCode(code){

		du.debug('Set Code');

		this.parameters.set('code', code);

		return true;

	}

	getCode(){

		du.debug('Get Code');

		let code = this.parameters.get('code', false);

		if(_.isNull(code)){
			return super.getCode();
		}

		return code;

	}

}
