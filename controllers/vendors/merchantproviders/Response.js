const _ = require('lodash');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const Response = global.SixCRM.routes.include('providers', 'Response.js');

module.exports = class MerchantProviderResponse extends Response{

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
			'vendorresponse':global.SixCRM.routes.path('model','vendors/merchantproviders/response/vendorresponse.json'),
			'action':global.SixCRM.routes.path('model', 'vendors/merchantproviders/action.json'),
			'additionalparameters': global.SixCRM.routes.path('model', 'vendors/merchantproviders/response/additionalparameters.json'),
			//Technical Debt:  Bad Paths...
			'code': global.SixCRM.routes.path('model','vendors/merchantproviders/response/code.json'),
			'result': global.SixCRM.routes.path('model','vendors/merchantproviders/response/result.json'),
			'message': global.SixCRM.routes.path('model','vendors/merchantproviders/response/message.json'),
			'parsedresponse':global.SixCRM.routes.path('model','vendors/merchantproviders/response/parsedresponse.json')
		};

		this.result_messages = {
			'success':'Success',
			'decline': 'Declined',
			'harddecline': 'Hard decline',
			'error': 'Error'
		};

		this.initialize();

		this.handleResponse(arguments[0]);

	}

	getMerchantProviderName(){
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
				let action = this.parameters.get('action');

				let response = vendor_response.response;
				let body = vendor_response.body;

				this.parameters.set('response', response);
				this.parameters.set('body', body);

				this.validateVendorResponse();

				let result_code = this.determineResultCode({vendor_response, action});
				let result_message = this.determineResultMessage(result_code);

				if(_.isFunction(this.translateResponse)){

					let parsed_response = this.translateResponse(response);

					if(!_.isNull(parsed_response)){
						this.parameters.set('parsedresponse', parsed_response);
					}

				}

				this.setCode(result_code);
				this.setMessage(result_message);
				this.setMerchantCode(this.determineMerchantCode(vendor_response));
				this.setMerchantMessage(this.determineMerchantMessage(vendor_response));
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

	determineResultCode({vendor_response}){
		const {response} = vendor_response;

		if(_.has(response, 'statusCode')){

			if(response.statusCode == 200){

				return 'success';

			}

		}

		return 'error';

	}

	determineResultMessage(result_code){
		return this.result_messages[result_code];

	}

	determineMerchantCode(vendor_response) {

		let result = vendor_response;

		result = _(vendor_response).get('body.code', result);
		result = _(vendor_response).get('response.body.code', result);
		result = _(vendor_response).get('statusCode', result);
		result = _(vendor_response).get('response.statusCode', result);

		if (typeof result !== 'string') {
			result = '';
		}

		return result;
	}

	determineMerchantMessage() {

		return 'Unexpected response for ' + this.getCode();

	}

	validateVendorResponse(){
		let merchant_provider_name = this.getMerchantProviderName();
		let response = this.parameters.get('response');

		global.SixCRM.validate(response, global.SixCRM.routes.path('model', 'vendors/merchantproviders/'+merchant_provider_name+'/response.json'));

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

	getMerchantMessage(){
		const merchantMessage = this.parameters.get('merchant_message');

		return merchantMessage

	}

	getMerchantCode(){
		const merchantCode = this.parameters.get('merchant_code');

		return merchantCode

	}

	setCode(code){
		this.parameters.set('code', code);

		return true;

	}

	setMerchantMessage(message){

		this.parameters.set('merchant_message', message)

	}

	setMerchantCode(code){

		this.parameters.set('merchant_code', code);
	}

	getCode(){
		let code = this.parameters.get('code', {fatal: false});

		if(_.isNull(code)){
			return super.getCode();
		}

		return code;

	}

}
