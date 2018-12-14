const _ = require('lodash');
const querystring = require('querystring');
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');

const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');

class NMIController extends MerchantProvider {

	//Technical Debt:  Need to make use of processor_id somewhere...
	constructor({merchant_provider}){

		super(arguments[0]);

		this.configure(merchant_provider.gateway);

		this.merchant_provider_parameters = {
			required: {
				username: 'username',
				password:'password',
			},
			optional: {
				processor_id: 'processor_id'
			}
		};

		this.method_parameters = {
			required: {
				type: 'type'
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
					ccnumber:'creditcard.number',
					ccexp:'creditcard.expiration'
				},
				optional:{
					cvv:'creditcard.cvv',
					firstname:'customer.firstname',
					lastname:'customer.lastname',
					address1:'creditcard.address.line1',
					address2:'creditcard.address.line2',
					city:'creditcard.address.city',
					state:'creditcard.address.state',
					zip:'creditcard.address.zip',
					country:'creditcard.address.country',
					phone: 'customer.phone',
					email: 'customer.email',
					shipping_firstname: 'customer.firstname',
					shipping_lastname: 'customer.lastname',
					shipping_address1: 'customer.address.line1',
					shipping_address2: 'customer.address.line2',
					shipping_city: 'customer.address.city',
					shipping_state: 'customer.address.state',
					shipping_zip: 'customer.address.zip',
					shipping_country: 'customer.address.country'
					//orderdescription
					//order_id
				}
			},
			refund: {
				required:{
					transactionid:'transactionid'
				},
				optional:{
					amount:'amount'
				}
			},
			reverse: {
				required:{
					transactionid:'transactionid'
				}
			},
			validate:{
				required:{}
			}
		};

	}

	refund(request_parameters){
		this.parameters.set('action','refund');
		const method_parameters = {type: 'refund'};

		if (objectutilities.hasRecursive(request_parameters, 'transaction.processor_response.result.response.body')) {
			let {transactionid} = querystring.parse(request_parameters.transaction.processor_response.result.response.body);
			request_parameters.transactionid = transactionid;
		}

		return this.postToProcessor({action: 'refund', method_parameters: method_parameters, request_parameters: request_parameters})
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

	reverse(request_parameters){
		this.parameters.set('action','reverse');
		const method_parameters = {type: 'void'};

		if (objectutilities.hasRecursive(request_parameters, 'transaction.processor_response.result.response.body')) {
			let {transactionid} = querystring.parse(request_parameters.transaction.processor_response.result.response.body);
			request_parameters.transactionid = transactionid;
		}

		return this.postToProcessor({action: 'reverse', method_parameters: method_parameters, request_parameters: request_parameters})
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

		//.then((response_object) => this.getResponseObject(response_object));

	}

	process(request_parameters){
		this.parameters.set('action', 'process');
		const method_parameters = {type: 'sale'};

		if(_.has(request_parameters, 'creditcard')){
			let creditCardHelperController = new CreditCardHelperController();
			request_parameters.creditcard.firstname = creditCardHelperController.getFirstName(request_parameters.creditcard);
			request_parameters.creditcard.lastname = creditCardHelperController.getLastName(request_parameters.creditcard);
		}

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

	test(request_parameters){
		this.parameters.set('action', 'test');
		const method_parameters = {type: 'validate'};

		return this.postToProcessor({action: 'validate', method_parameters: method_parameters, request_parameters: request_parameters})
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

}

module.exports = NMIController;
