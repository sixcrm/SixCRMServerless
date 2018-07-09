
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const HttpProvider = require('@6crm/sixcrmcore/providers/http-provider').default;
const httpprovider = new HttpProvider();

const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');

class TestController extends MerchantProvider {

	//Technical Debt:  Need to make use of processor_id somewhere...
	constructor({merchant_provider}){

		super(arguments[0]);

		this.configure(merchant_provider.gateway);

		this.merchant_provider_parameters = {
			required: {
			},
			optional: {
				username: 'username',
				password:'password',
				processor_id: 'processor_id'
			}
		};

		this.method_parameters = {
			required: {
				path: 'path'
			}
		};

		this.vendor_parameters = {
			required:{
				endpoint:'endpoint'
			}
		};

		this.transaction_parameters = {
			process: {
				required: {
					amount:'amount',
					creditcard:'creditcard',
					customer:'customer'
				},
				optional:{}
			},
			refund: {
				required:{
					transactionid:'transaction.processor_response.result.transactionid'
				},
				optional:{
					amount:'amount'
				}
			},
			reverse: {
				required:{
					transactionid:'transaction.processor_response.result.transactionid'
				}
			}
		};

	}

	/* Currently not supported
    refund(request_parameters){

      du.debug('Refund');

      const method_parameters = {type: 'refund'};

      return this.postToProcessor({action: 'refund', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response_object) => this.getResponseObject(response_object));

    }

    */

	/* Currently not supported
    reverse(request_parameters){

      du.debug('Reverse');

      const method_parameters = {type: 'void'};

      return this.postToProcessor({action: 'reverse', method_parameters: method_parameters, request_parameters: request_parameters})
      .then((response_object) => this.getResponseObject(response_object));

    }
    */

	process(request_parameters){

		du.debug('Process');

		this.parameters.set('action', 'process');

		const method_parameters = {
			path: 'authorize'
		};

		return this.postToProcessor({action: 'process', method_parameters: method_parameters, request_parameters: request_parameters})
			.then(result => {
				let response_object = {
					error: null,
					response: result.response,
					body: result.response.body
				};

				this.parameters.set('vendorresponse', response_object);
				return true;
			})
			.then(() => this.respond({}));

	}

	setRequestParameters({type, request_parameters, return_parameters}){

		du.debug('Set Request Parameters');

		objectutilities.hasRecursive(this.transaction_parameters, type+'.required', true);

		return_parameters = objectutilities.transcribe(this.transaction_parameters[type].required, request_parameters, return_parameters, true);

		if(objectutilities.hasRecursive(this.transaction_parameters, type+'.optional')){
			return_parameters = objectutilities.transcribe(this.transaction_parameters[type].optional, request_parameters, return_parameters, false);
		}

		delete return_parameters.customer.id;
		delete return_parameters.customer.email;
		delete return_parameters.endpoint;
		delete return_parameters.username;
		delete return_parameters.password;
		delete return_parameters.path;

		return return_parameters;

	}

	postToProcessor({action, method_parameters, request_parameters}){

		du.debug('Post To Processor');

		let parameters = this.createParameterObject();

		let endpoint = this.createEndpoint(method_parameters);

		parameters = this.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters});

		parameters = this.setRequestParameters({type: action, request_parameters: request_parameters, return_parameters: parameters});

		this.validateRequestParameters(action, parameters);

		var request_options = {
			body: parameters,
			url: endpoint
		}

		return httpprovider.postJSON(request_options).then(result => {

			if(_.isError(result.error)){
				du.error(result.error);
				return Promise.reject(result.error);
			}

			return {
				response: result.response,
				body: result.body
			};

		});

	}

}

module.exports = TestController;
