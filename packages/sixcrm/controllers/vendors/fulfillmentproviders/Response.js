
const _ = require('lodash');
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
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
		this.parameters.setParameterValidation({parameter_validation: this.parameter_validation});
		this.parameters.setParameterDefinition({parameter_definition: this.parameter_definition});

		return true;

	}

	getFulfillmentProviderName(){
		return objectutilities.getClassName(this).replace('Response', '');

	}

	handleResponse(){
		this.parameters.setParameters({argumentation: arguments[0], action: 'handleResponse'});

		let error = this.parameters.get('error', {fatal: false});

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
		return this.parameters.get('parsedresponse', {fatal: false});

	}

	setResponse(response){
		this.parameters.set('response', response);

	}

	setAllProperties({code, message}){
		this.setCode(code);

		this.setMessage(message);

		//this.setResponse(response);

	}

	determineResultCode({response: response}){
		if(_.has(response, 'statusCode')){

			if(response.statusCode == 200){

				return 'success';

			}

			return 'fail';

		}

		return 'error';

	}

	determineResultMessage(result_code){
		return this.result_messages[result_code];

	}

	validateVendorResponse(){
		let fulfillment_provider_name = this.getFulfillmentProviderName();
		let response = this.parameters.get('response');

		global.SixCRM.validate(response, global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/'+fulfillment_provider_name+'/response.json'));

		return true;

	}

	handleError(error){
		this.setCode('error');

		if(_.has(error, 'message')){
			this.setMessage(error.message);
		}else{
			this.setMessage(this.determineResultMessage('error'));
		}

	}

	getResult(){
		return {
			code: this.getCode(),
			response: this.getResponse(),
			message: this.getMessage()
		};

	}

	getResponse(){
		return this.parameters.get('response', {fatal: false});

	}

	setMessage(message){
		this.parameters.set('message', message);

		return true;

	}

	getMessage(){
		return this.parameters.get('message')

	}

	setCode(code){
		this.parameters.set('code', code);

		return true;

	}

	getCode(){
		let code = this.parameters.get('code', {fatal: false});

		if(_.isNull(code)){
			return super.getCode();
		}

		return code;

	}

}
