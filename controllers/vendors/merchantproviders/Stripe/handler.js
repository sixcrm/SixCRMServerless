const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const parserutilities = require('@6crm/sixcrmcore/util/parser-utilities').default;

const CustomerHelperController =  global.SixCRM.routes.include('helpers', 'entities/customer/Customer.js');
const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
const TagHelperController = global.SixCRM.routes.include('helpers', 'entities/tag/Tag.js');

const MerchantProvider = global.SixCRM.routes.include('vendors', 'merchantproviders/MerchantProvider.js');

/*
Notes:
	- Make sure that the assure/validate methods work
	- Validate Charge Description
	- Charge Meta?
	- Create a recurring transaction method
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
			//'creditcardtoken':global.SixCRM.routes.path('model', 'vendors/merchantproviders/Stripe/creditcardtokenresponse.json')
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
				optional:{
					amount: 'amount'
				}
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

		const StripeAPI = global.SixCRM.routes.include('controllers', 'vendors/merchantproviders/Stripe/api.js');
		this.stripe = new StripeAPI(merchant_provider.gateway.api_key);

	}

	async process({customer, creditcard, amount}){
		this.setMethod(this.methods['process']);
		this.parameters.set('action','process');

		//let charge_description = this._createChargeDescription();
		let stripe_source = await this._getCardToken({creditcard: creditcard, customer: customer});

		if(this._isError(stripe_source)){
			this.parameters.set('vendorresponse', stripe_source);
			return this.respond({});
		}

		let stripe_customer = await this._getCustomer({customer: customer, stripe_source: stripe_source});
		if(this._isError(stripe_customer)){
			this.parameters.set('vendorresponse', stripe_customer);
			return this.respond({});
		}

		this.parameters.set('amount', amount);
		this.parameters.set('sourcetoken', stripe_source);
		this.parameters.set('customertoken', stripe_customer);

		if(!this._assureCustomerProperties({customer: customer, stripe_customer: stripe_customer, stripe_source: stripe_source})){
			return this.respond({});
		}

		this.createParametersObject();

		await this.issueRequest();

		return this.respond({});

	}

	_isError(object){
		if(_.has(object, 'error')){
			return true;
		}

		return false;

	}

	async refund(){
		let argumentation = arguments[0];

		argumentation.action = 'refund';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'refund'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	async reverse(){
		let argumentation = arguments[0];

		argumentation.action = 'reverse';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'reverse'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	async test(){
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

	_validateCreditCardProperties({stripe_source}){
		if(_.has(stripe_source, 'status') && stripe_source.status == 'consumed'){
			return false;
		}

		//same owner.address,
		//same owner.name
		//same lastFour
		//same expiration month
		//same expiration year
		////if it doesn't match, create a new creditcard token

		return true;

	}

	_assureCustomerProperties({stripe_customer}){
		if(_.has(stripe_customer, 'error')){
			this.parameters.set('vendorresponse', stripe_customer);
			return false;
		}

		//if the source isnt in the customer, update the customer

		//check that the customer address matches
		//check that the customer name matches
		//check that the customer has the source
		////update the customer if any property is not true

		return true;


	}

	async _retrieveCustomer(stripe_token){
		let stripe_customer_record = await this.stripe.getCustomer(stripe_token);

		if(_.has(stripe_customer_record, 'id')){
			return stripe_customer_record;
		}

		if(_.has(stripe_customer_record, 'error')){
			if(stripe_customer_record.error.statusCode != 404){
				throw stripe_customer_record.error;
			}
		}

		return null;

	}

	async _createCustomer({customer, stripe_source}){
		let customer_parameters_object = this._createCustomerParameters({customer: customer, stripe_source: stripe_source});
		let stripe_customer = await this.stripe.createCustomer(customer_parameters_object);

		if(_.has(stripe_customer, 'id')){
			this._storeStripeTokenInTags({entity: customer, key: 'stripe_token', value: stripe_customer.id});
		}

		return stripe_customer;

	}

	_createCustomerParameters({customer, stripe_source}){
		let customer_parameters = {
			source: stripe_source.id,
			//default_source: stripe_source.id, (Note: throws a API error when present in test mode...)
			email: customer.email
		};

		let shipping_object = this._createCustomerShippingObject(customer);

		if(!_.isNull(shipping_object)){
			customer_parameters.shipping = shipping_object;
		}

		return customer_parameters;

	}

	_createCustomerShippingObject(customer){
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

	async _storeStripeTokenInTags({entity, key, value}){
		let tagHelperController = new TagHelperController();

		return tagHelperController.putTag({entity: entity, key: key, value: value});

	}

	async _getCustomer({customer, stripe_source}){
		let customerHelperController = new CustomerHelperController();
		let customer_stripe_token = await customerHelperController.getTag(customer, 'stripe_token');

		let stripe_customer_record = null;

		if(!_.isNull(customer_stripe_token)){
			stripe_customer_record = await this._retrieveCustomer(customer_stripe_token);
		}

		if(_.isNull(stripe_customer_record)){
			stripe_customer_record = await this._createCustomer({customer, stripe_source});
		}else{

			let found_source = arrayutilities.find(stripe_customer_record.sources.data, source => {
				return source.id == stripe_source.id;
			});

			if(_.isUndefined(found_source) || _.isNull(found_source)){

				let updated_customer = await this.stripe.updateCustomer({customer_token: stripe_customer_record.id, parameters: {source: stripe_source.id}});

				stripe_customer_record = updated_customer;

			}

		}

		return stripe_customer_record;

	}

	async _getCardToken({creditcard, customer}){
		let creditCardHelperController = new CreditCardHelperController();
		let cc_tag_key = parserutilities.parse('customer_{{id}}_stripe_source_token', customer);
		let stripe_token = await creditCardHelperController.getTag(creditcard, cc_tag_key);

		if(!_.isNull(stripe_token)){
			let stripe_source = await this._retrieveCreditCard(stripe_token);

			if(!_.isNull(stripe_source) && this._validateCreditCardProperties({creditcard: creditcard, stripe_source: stripe_source})){
				return stripe_source;
			}

		}

		let stripe_source = await this._createCardToken(creditcard);

		if(_.has(stripe_source, 'id')){
			this._storeStripeTokenInTags({entity: creditcard, key: cc_tag_key, value: stripe_source.id});
		}

		if(_.has(stripe_source, 'error')){
			//this is a error, return a decline now...
		}

		return stripe_source;

	}

	async _retrieveCreditCard(stripe_token){
		let stripe_source_record = await this.stripe.getSource(stripe_token);

		if(_.has(stripe_source_record, 'id')){
			return stripe_source_record;
		}

		if(_.has(stripe_source_record, 'error')){
			if(stripe_source_record.error.statusCode != 400){
				throw stripe_source_record.error;
			}
		}

		return null;

	}

	async _createCardToken(creditcard){
		let parameters_object = this._createCreditCardTokenParameters(creditcard);

		let result = await this.stripe.createSource(parameters_object);

		return result;

	}

	_createCreditCardTokenParameters(creditcard){
		let card_object = objectutilities.transcribe(
			{
				number: 'number'
			},
			creditcard,
			{},
			true
		);

		card_object = objectutilities.transcribe(
			{
				cvc: 'vv'
			},
			creditcard,
			card_object,
			false
		);

		let creditCardHelperController = new CreditCardHelperController();

		card_object.exp_month = creditCardHelperController.getExpirationMonth(creditcard);
		card_object.exp_year = creditCardHelperController.getExpirationYear(creditcard);

		let source_parameters = {
			type: 'card',
			currency: 'usd',
			usage: 'reusable',
			card: card_object
		}

		this._addOwnerFieldsToSource({creditcard: creditcard}, source_parameters);

		return source_parameters;

	}

	_addOwnerFieldsToSource({creditcard}, source_parameters){
		let owner = {};

		if(_.has(creditcard,  'address')){

			let owner_address = objectutilities.transcribe(
				{
					'city': 'city',
					'country': 'country',
					'line1': 'line1',
					'line2': 'line2',
					'state': 'state',
					'postal_code': 'zip'
				},
				creditcard.address,
				{},
				false
			);

			if(Object.keys(owner_address).length > 0){
				owner.address = owner_address;
			}

		}

		if(_.has(creditcard,  'name')){
			owner.name = creditcard.name;
		}

		if(Object.keys(owner).length > 0){
			source_parameters.owner = owner;
		}

	}

	getRefundsCreateRequestParameters(){
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
			parameters_object.amount = Math.round(amount * 100);
		}

		return parameters_object;

	}

	getCreateChargeRequestParameters(){
		let amount = this.parameters.get('amount');
		let source_token = this.parameters.get('sourcetoken');
		let customer_token = this.parameters.get('customertoken', {fatal: false});
		let charge_description = this.parameters.get('chargedescription', {fatal: false});
		let shipping_object = this.parameters.get('shippingobject', {fatal: false});

		amount = Math.round(amount * 100);

		let parameters = {
			amount: amount,
			currency: 'usd',
		};

		if(!_.isNull(customer_token)){
			parameters.customer = customer_token.id
		}

		parameters.source = source_token.id;

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
		let parameters_object = this.parameters.get('parametersobject');

		let response = await this.stripe.createRefund(parameters_object);

		this.parameters.set('vendorresponse', response);

		return true;

	}

	async issueCreateChargeRequest(){
		let parameters_object = this.parameters.get('parametersobject');

		let response = await this.stripe.createCharge(parameters_object);

		this.parameters.set('vendorresponse', response);

		return true;

	}

	async issueListChargesRequest(){
		let parameters_object = this.parameters.get('parametersobject');

		let response = await this.stripe.listCharges(parameters_object);

		this.parameters.set('vendorresponse', response);

		return true;

	}

	getListChargesRequestParameters(){
		if(this.parameters.get('action') == 'test'){
			return {limit: 1};
		}

	}

	_createChargeDescription(){
		let charge_description = 'SixCRM.com';

		this.parameters.set('chargedescription', charge_description);

		return charge_description;

	}

}

module.exports = StripeController;
