const _ = require('lodash');
const stripe = require('stripe');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const CustomerHelperController =  global.SixCRM.routes.include('helpers', 'entities/customer/Customer.js');
const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
const TagHelperController = global.SixCRM.routes.include('helpers', 'entities/tag/Tag.js');

const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');

/*
Notes:
	-  Make sure that the assure/validate methods work
	-  Write more test cases to validate
		- No cc tag
		- tag present

	-  Create a recurring transaction method
*/

class StripeController extends MerchantProvider {

	constructor({merchant_provider}){

		super(arguments[0]);

		this.configure(merchant_provider);

		this.methods = {
			process: 'CreateCharge',
			refund: 'RefundsCreate',
			test: 'ListCharges',
			reverse: 'RefundsCreate'
		};

		this.parameter_validation = {
			'creditcardtoken':global.SixCRM.routes.path('model', 'vendors/merchantproviders/Stripe/creditcardtokenresponse.json')
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
			refund:{
				required:{
					action: 'action',
					transaction:'transaction'
				},
				optional:{}
			},
			reverse:{
				required:{
					action: 'action',
					transaction:'transaction'
				},
				optional:{}
			}
		};

		this.augmentParameters();

		this.instantiateStripe();

		const StripeProvider = global.SixCRM.routes.include('providers', 'stripe-provider.js');
		this.stripeprovider = new StripeProvider(merchant_provider.gateway.api_key);

	}

	instantiateStripe(){

		du.debug('Instantiate Stripe');

		let api_key = this.parameters.get('merchantprovider').gateway.api_key;

		this.stripe = stripe(api_key);

	}

	async process({customer, creditcard, amount}){

		du.debug('Process');

		this.setMethod(this.methods['process']);

		let charge_description = this._createChargeDescription();

		let stripe_creditcard = await this._getCardToken(creditcard);
		let stripe_customer = await this._getCustomer({customer: customer, stripe_creditcard: stripe_creditcard});

		await this._assureCustomerProperties({customer: customer, stripe_customer: stripe_customer, stripe_creditcard: stripe_creditcard});

		//Note: Eliminate this...
		this.parameters.set('action','process');
		this.parameters.set('amount', amount);
		this.parameters.set('creditcardtoken', stripe_creditcard);
		this.parameters.set('customertoken', stripe_customer);

		let parameters = this.createParametersObject();
		let stripe_response = await this.issueRequest();

		return this.respond({});

	}

	refund(){

		du.debug('Refund');

		let argumentation = arguments[0];

		argumentation.action = 'refund';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'refund'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	reverse(){

		du.debug('Reverse');

		let argumentation = arguments[0];

		argumentation.action = 'reverse';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'reverse'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	test(){

		du.debug('Test');
		let argumentation = {
			action: 'test'
		};

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'test'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	getListChargesRequestParameters(){

		du.debug('Get List Charges Request Parameters');

		if(this.parameters.get('action') == 'test'){
			return {limit: 1};
		}

	}

	_createChargeDescription(){

		du.debug('Create Charge Description');

		let charge_description = 'SixCRM.com';

		this.parameters.set('chargedescription', charge_description);

		return charge_description;

	}

	async _validateCreditCardProperties({creditcard, stripe_creditcard}){

		du.debug('Assure CreditCard Properties');

		//same address,
		//same name
		//same lastFour
		//same expiration month
		//same expiration year
			//if it doesn't match, create a new creditcard token

		true;

	}

	async _assureCustomerProperties({customer, stripe_creditcard}){

		du.debug('Assure Customer CreditCard Parity');

		//check that the customer address matches
		//check that the customer name matches
		//check that the customer has the source
			//update the customer if any property is not true

		return true;


	}

	async _retrieveCustomer(stripe_token){

		du.debug('Retrieve Token');

		let stripe_customer_record = await this.stripeprovider.getCustomer(stripe_token);

		if(_.has(stripe_customer_record, 'id')){
			return stripe_customer_record;
		}

		if(_.has(stripe_customer_record, 'error')){
			if(stripe_customer_record.error.statusCode != '404'){
				throw stripe_customer_record.error;
			}
		}

		return null;

	}

	async _createCustomer({customer, stripe_creditcard}){

		du.debug('Create Customer');

		let customer_parameters_object = this._createCustomerParameters({customer: customer, stripe_creditcard: stripe_creditcard});
		let stripe_customer = await this.stripeprovider.createCustomer(customer_parameters_object);

		if(_.has(stripe_customer, 'id')){
			this._storeStripeTokenInTags({entity: customer, key: 'stripe_token', value: stripe_customer.id});
		}

		return stripe_customer;

	}

	async _storeStripeTokenInTags({entity, key, value}){

		du.debug('Store Stripe Token In Tags');

		let tagHelperController = new TagHelperController();

		return tagHelperController.putTag({entity: entity, key: key, value: value});

	}

	_createCustomerShippingObject(customer){

		du.debug('Create Customer Shipping Object');

		let customerHelperController = new CustomerHelperController();
		let customer_name = customerHelperController.getFullName(customer);

		if(stringutilities.nonEmpty(customer_name) && _.has(customer, 'address')){

			try{

				let shipping_address = objectutilities.transcribe(
					{
						'city': 'city',
		    		'country': 'country',
		    		'line1': 'line1',
		    		'state': 'state',
		    		'postal_code': 'zip'
					},
					customer.address,
					{},
					true
				);

				shipping_address = objectutilities.transcribe(
					{
		    		'line2': 'line2'
					},
					customer.address,
					shipping_address,
					false
				);

				let shipping_object = {
					address: shipping_address,
					name: customer_name
				};

				if(_.has(customer, 'phone')){
					shipping_object.phone = customer.phone;
				}

				this.parameters.set('shippingobject', shipping_object);

				return shipping_object;

			}catch(error){

				du.warning('Insufficient information to add shipping information to customer.');

			}

		}

		return null;

	}

	_createCustomerParameters({customer, stripe_creditcard}){

		du.debug('Create Customer Parameters');

		let customer_parameters = {
			source: stripe_creditcard.id,
			//default_source: stripe_creditcard.id, (Note: throws a API error when present in test mode...)
			email: customer.email
		};

		let shipping_object = this._createCustomerShippingObject(customer);

		if(!_.isNull(shipping_object)){
			customer_parameters.shipping = shipping_object;
		}

		return customer_parameters;

	}

	async _getCustomer({customer, stripe_creditcard}){

		du.debug('getStripeCustomerRecord');

		let customerHelperController = new CustomerHelperController();
		let customer_stripe_token = await customerHelperController.getTag(customer, 'stripe_token');

		let stripe_customer_record = null;

		if(!_.isNull(customer_stripe_token)){
			stripe_customer_record = await this._retrieveCustomer(customer_stripe_token);
		}

		if(_.isNull(stripe_customer_record)){
			stripe_customer_record = await this._createCustomer({customer, stripe_creditcard});
		}

		return stripe_customer_record;

	}

	async _getCardToken(creditcard){

		du.debug('Get Card Token');

		let creditCardHelperController = new CreditCardHelperController();
		let stripe_token = await creditCardHelperController.getTag(creditcard, 'stripe_token');

		if(!_.isNull(stripe_token)){
			let stripe_creditcard = await this._retrieveCreditCard(stripe_token);

			//assure that the fields are correct between the creditcard and the raw card

			if(!_.isNull(stripe_creditcard) && this._validateCreditCardProperties({creditcard: creditcard, stripe_creditcard: stripe_creditcard})){
				return stripe_creditcard;
			}

		}

		let stripe_creditcard = await this._createCardToken(creditcard);

		if(_.has(stripe_creditcard, 'id')){
			this._storeStripeTokenInTags({entity: creditcard, key: 'stripe_token', value: stripe_creditcard.id});
		}

		return stripe_creditcard;

	}

	async _retrieveCreditCard(stripe_token){

		du.debug('Retrieve Credit Card');

		let stripe_creditcard_record = await this.stripeprovider.getCreditCard(stripe_token);

		if(_.has(stripe_creditcard_record, 'id')){
			return stripe_creditcard_record;
		}

		if(_.has(stripe_creditcard_record, 'error')){
			if(stripe_creditcard_record.error.statusCode != 400){
				throw stripe_creditcard_record.error;
			}
		}

		return null;

	}

	_createCardToken(creditcard){

		du.debug('Create Card Token');

		let parameters_object = this._createCreditCardTokenParameters(creditcard);

		return this.stripeprovider.createCreditCard(parameters_object);

	}

	_createCreditCardTokenParameters(creditcard){

		du.debug('Create Credit Card Token Parameters');

		let token_request_object = objectutilities.transcribe(
			{
				number: 'number',
				cvc: 'cvv'
			},
			creditcard,
			{},
			false
		);

		if(_.has(creditcard,  'address')){

			token_request_object = objectutilities.transcribe(
				{
					'address_city': 'city',
	    		'address_country': 'country',
	    		'address_line1': 'line1',
	    		'address_line2': 'line2',
	    		'address_state': 'state',
	    		'address_zip': 'zip'
				},
				creditcard.address,
				token_request_object,
				false
			);

		}

		if(_.has(creditcard,  'name')){
			token_request_object.name = creditcard.name;
		};

		token_request_object.currency = 'usd';

		let creditCardHelperController = new CreditCardHelperController();

		token_request_object.exp_month = creditCardHelperController.getExpirationMonth(creditcard);
		token_request_object.exp_year = creditCardHelperController.getExpirationYear(creditcard);

		return {
			card: token_request_object
		};

	}

	getRefundsCreateRequestParameters(){

		du.debug('Get Refunds Create Request Parameters');

		let transaction = this.parameters.get('transaction');
		let amount = this.parameters.get('amount', {fatal: false});
		let action = this.parameters.get('action');

		let parameters_object = {
			charge: transaction.processor_response.result.id
		};

		if (objectutilities.hasRecursive(transaction, 'processor_response.result.response.body.id')) {
			parameters_object.charge = transaction.processor_response.result.response.body.id;
		}

		if(action == 'reverse'){
			parameters_object.reverse_transfer = true;
		}

		if(!_.isNull(amount) && action !== 'reverse'){
			parameters_object.amount = amount * 100;
		}

		return parameters_object;

	}


	getCreateChargeRequestParameters(){

		du.debug('Get List Charges Request Parameters');

		let amount = this.parameters.get('amount');
		let credit_card_token = this.parameters.get('creditcardtoken').id;
		let customer_token = this.parameters.get('customertoken', {fatal: false});
		let charge_description = this.parameters.get('chargedescription', {fatal: false});
		let shipping_object = this.parameters.get('shippingobject', {fatal: false});

		amount = amount * 100;

		let parameters = {
			amount: amount,
			currency: 'usd',
			source: credit_card_token
		};

		if(!_.isNull(customer_token)){
			parameters.customer = customer_token.id
		}

		if(!_.isNull(charge_description)){
			parameters.description = charge_description;
			parameters.statement_descriptor = charge_description;
		}

		if(!_.isNull(shipping_object)){
			parameters.shipping = shipping_object;
		}

		this.parameters.set('parametersobject', parameters);

		return parameters;

	}

	async issueRefundsCreateRequest(){

		du.debug('Issue Refunds Create Request');

		let parameters_object = this.parameters.get('parametersobject');

		let response = await this.stripeprovider.createRefund(parameters_object);

		this.parameters.set('vendorresponse', response);

		return true;

	}

	async issueCreateChargeRequest(){

		du.debug('Issue Create Charge Request');

		let parameters_object = this.parameters.get('parametersobject');

		let response = await this.stripeprovider.createCharge(parameters_object);

		this.parameters.set('vendorresponse', response);

		return true;

	}

	async issueListChargesRequest(){

		du.debug('Issue List Charges Request');

		let parameters_object = this.parameters.get('parametersobject');

		let response = await this.stripeprovider.listCharges(parameters_object);

		this.parameters.set('vendorresponse', response);

		return true;

	}

}

module.exports = StripeController;
