
const querystring = require('querystring');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const HttpProvider = require('@6crm/sixcrmcore/providers/http-provider').default;
const httpprovider = new HttpProvider();

const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');

class InnovioController extends MerchantProvider {

	constructor({merchant_provider}){

		super(arguments[0]);

		this.configure(merchant_provider);

		this.methods = {
			process: 'CCAUTHCAP',
			refund: 'CCCREDIT',
			test: 'TESTAUTH',
			reverse: 'CCREVERSE'
		};

		this.parameter_definition = {
			process:{
				required:{
					action: 'action',
					customer: 'customer',
					creditcard: 'creditcard',
					amount: 'amount'
				},
				optional:{}
			},
			test:{
				required:{
					action: 'action'
				},
				optional:{}
			},
			reverse:{
				required:{
					action: 'action',
					transaction:'transaction'
				},
				optional:{}
			},
			refund:{
				required:{
					action: 'action',
					transaction:'transaction'
				},
				optional:{
					amount: 'amount'
				}
			}
		};

		this.augmentParameters();

	}

	process(){
		let argumentation = arguments[0];

		argumentation.action = 'process';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'process'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	reverse(){
		let argumentation = arguments[0];

		argumentation.action = 'reverse';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'reverse'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	refund(){
		let argumentation = arguments[0];

		argumentation.action = 'refund';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'refund'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	test(){
		let argumentation = arguments[0];

		argumentation.action = 'test';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'test'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => {
				du.info(this.parameters.get('vendorresponse'));
				return true;
			})
			.then(() => this.respond({}));

	}


	getCCAUTHCAPRequestParameters(){
		let creditcard = this.parameters.get('creditcard');
		let customer = this.parameters.get('customer');
		let amount = this.parameters.get('amount');

		let source_object = {
			creditcard: creditcard,
			amount: amount,
			customer: customer,
			count: 1
		};

		let parameter_specification = {
			required:{
				li_value_1:'amount',
				li_count_1:'count',
				pmt_numb:'creditcard.number',
				pmt_expiry:'creditcard.expiration'
			},
			optional:{
				cust_fname:'customer.firstname',
				cust_lname:'customer.lastname',
				cust_email:'customer.email',
				//Technical Debt:  We don't have this any longer...
				pmt_key:'creditcard.cvv',
				//cust_login:'',
				//cust_password:'',
				bill_addr:'creditcard.address.line1',
				bill_addr_city:'creditcard.address.city',
				bill_addr_state:'creditcard.address.state',
				bill_addr_zip:'creditcard.address.zip',
				bill_addr_country:'creditcard.address.country',
				xtl_order_id:'transaction.alias',
				xtl_cust_id:'customer.id',
				xtl_ip:'session.ip_address'
			}
		}

		let request_parameters = objectutilities.transcribe(
			parameter_specification.required,
			source_object,
			{},
			true
		);

		request_parameters = objectutilities.transcribe(
			parameter_specification.optional,
			source_object,
			request_parameters,
			false
		);

		return request_parameters;

	}

	getCCCREDITRequestParameters(){
		let transaction = this.parameters.get('transaction');
		let amount = this.parameters.get('amount');

		let source_object = {
			amount: amount,
			transaction: transaction
		};

		let parameter_specification = {
			required:{
				request_ref_po_id:'transaction.processor_response.result.PO_ID',
				li_value_1:'amount'
			},
			optional:{
			}
		}

		let request_parameters = objectutilities.transcribe(
			parameter_specification.required,
			source_object,
			{},
			true
		);

		request_parameters = objectutilities.transcribe(
			parameter_specification.optional,
			source_object,
			request_parameters,
			false
		);

		return request_parameters;

	}

	getCCREVERSERequestParameters(){
		let transaction = this.parameters.get('transaction');

		let source_object = {
			transaction: transaction
		};

		let parameter_specification = {
			required:{
				request_ref_po_id:'transaction.processor_response.result.PO_ID',
			},
			optional:{
			}
		}

		let request_parameters = objectutilities.transcribe(
			parameter_specification.required,
			source_object,
			{},
			true
		);

		request_parameters = objectutilities.transcribe(
			parameter_specification.optional,
			source_object,
			request_parameters,
			false
		);

		return request_parameters;

	}

	issueCCAUTHCAPRequest(){
		let parameters_object = this.parameters.get('parametersobject');

		let endpoint = parameters_object.endpoint;

		delete parameters_object.endpoint;

		let parameter_querystring = querystring.stringify(parameters_object);

		var request_options = {
			headers: {'content-type' : 'application/x-www-form-urlencoded'},
			url: endpoint,
			body: parameter_querystring
		};

		return httpprovider.post(request_options).then(result => {

			this.parameters.set('vendorresponse', result);
			return true;

		});

	}

	issueCCREVERSERequest(){
		let parameters_object = this.parameters.get('parametersobject');

		let endpoint = parameters_object.endpoint;

		delete parameters_object.endpoint;

		let parameter_querystring = querystring.stringify(parameters_object);

		var request_options = {
			headers: {'content-type' : 'application/x-www-form-urlencoded'},
			url: endpoint,
			body: parameter_querystring
		};

		return httpprovider.post(request_options).then(result => {

			this.parameters.set('vendorresponse', result);
			return true;

		});

	}

	issueCCCREDITRequest(){
		let parameters_object = this.parameters.get('parametersobject');

		let endpoint = parameters_object.endpoint;

		delete parameters_object.endpoint;

		let parameter_querystring = querystring.stringify(parameters_object);

		var request_options = {
			headers: {'content-type' : 'application/x-www-form-urlencoded'},
			url: endpoint,
			body: parameter_querystring
		};

		return httpprovider.post(request_options).then(result => {

			this.parameters.set('vendorresponse', result);
			return true;

		});

	}

	issueTESTAUTHRequest(){
		let parameters_object = this.parameters.get('parametersobject');

		let endpoint = parameters_object.endpoint;

		delete parameters_object.endpoint;

		let parameter_querystring = querystring.stringify(parameters_object);

		var request_options = {
			headers: {'content-type' : 'application/x-www-form-urlencoded'},
			url: endpoint,
			body: parameter_querystring
		};

		return httpprovider.post(request_options).then(result => {

			this.parameters.set('vendorresponse', result);
			return true;

		});

	}

	getTESTAUTHMerchantProviderParameters(){
		let merchant_provider = this.parameters.get('merchantprovider');

		let source_object = {
			merchant_provider: merchant_provider
		};

		let parameter_specification = {
			required:{
				req_username: 'merchant_provider.gateway.username',
				req_password:'merchant_provider.gateway.password',
				site_id: 'merchant_provider.gateway.site_id',
				merchant_acct_id: 'merchant_provider.gateway.merchant_account_id',
				li_prod_id_1:'merchant_provider.gateway.product_id'
			},
			optional:{
			}
		}

		let request_parameters = objectutilities.transcribe(
			parameter_specification.required,
			source_object,
			{},
			true
		);

		request_parameters = objectutilities.transcribe(
			parameter_specification.optional,
			source_object,
			request_parameters
		);

		return request_parameters;

	}

	getCCAUTHCAPMerchantProviderParameters(){
		let merchant_provider = this.parameters.get('merchantprovider');

		let source_object = {
			merchant_provider: merchant_provider
		};

		let parameter_specification = {
			required:{
				req_username: 'merchant_provider.gateway.username',
				req_password:'merchant_provider.gateway.password',
				site_id: 'merchant_provider.gateway.site_id',
				merchant_acct_id: 'merchant_provider.gateway.merchant_account_id',
				li_prod_id_1:'merchant_provider.gateway.product_id'
			},
			optional:{
			}
		}

		let request_parameters = objectutilities.transcribe(
			parameter_specification.required,
			source_object,
			{},
			true
		);

		request_parameters = objectutilities.transcribe(
			parameter_specification.optional,
			source_object,
			request_parameters
		);

		return request_parameters;

	}

	getCCREVERSEMerchantProviderParameters(){
		let merchant_provider = this.parameters.get('merchantprovider');

		let source_object = {
			merchant_provider: merchant_provider
		};

		let parameter_specification = {
			required:{
				req_username: 'merchant_provider.gateway.username',
				req_password:'merchant_provider.gateway.password',
				site_id: 'merchant_provider.gateway.site_id',
				merchant_acct_id: 'merchant_provider.gateway.merchant_account_id',
				li_prod_id_1:'merchant_provider.gateway.product_id'
			},
			optional:{
			}
		}

		let request_parameters = objectutilities.transcribe(
			parameter_specification.required,
			source_object,
			{},
			true
		);

		request_parameters = objectutilities.transcribe(
			parameter_specification.optional,
			source_object,
			request_parameters
		);

		return request_parameters;

	}

	getCCREFUNDMerchantProviderParameters(){
		let merchant_provider = this.parameters.get('merchantprovider');

		let source_object = {
			merchant_provider: merchant_provider
		};

		let parameter_specification = {
			required:{
				req_username: 'merchant_provider.gateway.username',
				req_password:'merchant_provider.gateway.password',
				site_id: 'merchant_provider.gateway.site_id',
				merchant_acct_id: 'merchant_provider.gateway.merchant_account_id',
				li_prod_id_1:'merchant_provider.gateway.product_id'
			},
			optional:{
			}
		}

		let request_parameters = objectutilities.transcribe(
			parameter_specification.required,
			source_object,
			{},
			true
		);

		request_parameters = objectutilities.transcribe(
			parameter_specification.optional,
			source_object,
			request_parameters
		);

		return request_parameters;

	}

	getTESTAUTHMethodParameters(){
		return {request_action: 'TESTAUTH'};

	}

	getCCAUTHCAPMethodParameters(){
		return {request_action: 'CCAUTHCAP'};

	}

	getCCREVERSEMethodParameters(){
		return {request_action: 'CCREVERSE'};

	}

	getCCCREDITMethodParameters(){
		return {request_action: 'CCCREDIT'};

	}

}

module.exports = InnovioController;
