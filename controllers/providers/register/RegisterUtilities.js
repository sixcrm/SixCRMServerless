
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');

module.exports = class RegisterUtilities extends PermissionedController {

	constructor(){

		super();

		const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

		this.rebillHelperController = new RebillHelperController();

		//const ProductScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
		//this.productScheduleHelperController = new ProductScheduleHelperController();

	}

	acquireRebillProperties(){

		du.debug('Acquire Rebill Properties');

		let rebill = this.parameters.get('rebill');

		return this.rebillController.getParentSession(rebill).then(result => {
			this.parameters.set('parentsession', result);
			return true;
		})

	}

	acquireRebill(){

		du.debug('Acquire Rebill');

		let transaction = this.parameters.get('transaction');

		if (!_.has(transaction, 'rebill')) {
			transaction = this.parameters.get('associatedtransaction');
		}

		return this.rebillController.get({id: transaction.rebill}).then((rebill) => {

			this.parameters.set('rebill', rebill);

			return true;

		});

	}

	validateRebillForProcessing(){

		du.debug('Validate Rebill For Processing');

		return this.validateRebillTimestamp()
			.then(() => this.validateAttemptRecord())
			.then(() => this.validateSession())
			.catch((error) => {
				du.error(error);
				return Promise.reject(error);
			});

	}

	validateSession(){

		du.debug('Validate Session');

		let parentsession = this.parameters.get('parentsession');

		let day_in_cycle = this.rebillHelperController.calculateDayInCycle(parentsession.created_at);

		if(!_.isNumber(day_in_cycle) || day_in_cycle < 0){
			throw eu.getError('server', 'Invalid day in cycle returned for session.');
		}

		return Promise.resolve(true);

	}

	validateAttemptRecord(){

		du.debug('Validate Attempt Record');

		let rebill = this.parameters.get('rebill');

		if(_.has(rebill, 'second_attempt')){

			throw eu.getError('server','The rebill has already been attempted three times.');

		}

		if(_.has(rebill, 'first_attempt')){

			let time_difference = timestamp.getTimeDifference(rebill.first_attempt);

			if(time_difference < (60 * 60 * 24)){

				throw eu.getError('server','Rebill\'s first attempt is too recent.');

			}

		}

		return Promise.resolve(true);

	}

	validateRebillTimestamp(){

		du.debug('Validate Rebill Timestamp');

		let rebill = this.parameters.get('rebill');

		if(!this.rebillHelperController.isAvailable({rebill: rebill})){
			throw eu.getError('server', 'Rebill is not eligible for processing at this time.');
		}

		return Promise.resolve(true);

	}

	acquireRebillSubProperties(){

		du.debug('Acquire Rebill Sub-Properties');

		return this.acquireCustomer()
			.then(() => this.acquireCustomerCreditCards())
			.then(() => this.selectCustomerCreditCard())
			.then(() => this.hydrateSelectedCreditCard())
			.then(() => this.acquireMerchantProviderGroups());

	}

	acquireMerchantProviderGroups(){

		du.debug('Acquire Merchant Provider Groups');

		let rebill =  this.parameters.get('rebill');
		let creditcard = this.parameters.get('selectedcreditcard');

		if(_.has(rebill, 'merchant_provider')){

			//Note:  Merchant Provider is provided in the rebill so, we're hotwiring the SOB
			let merchant_provider_groups = {};

			merchant_provider_groups[rebill.merchant_provider] = [rebill.products];

			this.parameters.set('merchantprovidergroups', merchant_provider_groups);

			return Promise.resolve(true);

		}else{

			const MerchantProviderSelectorHelperController = global.SixCRM.routes.include('helpers','transaction/MerchantProviderSelector.js');
			let merchantProviderSelectorHelperController = new MerchantProviderSelectorHelperController();

			return merchantProviderSelectorHelperController.buildMerchantProviderGroups({rebill: rebill, creditcard: creditcard})
				.then((merchant_provider_groups) => {

					this.parameters.set('merchantprovidergroups', merchant_provider_groups);

					return true;

				});

		}

	}

	hydrateTransaction(){

		du.debug('Hydrate Transaction');

		let transaction = this.parameters.get('transaction');

		return this.transactionController.get({id: transaction, fatal: true}).then(transaction => {

			this.parameters.set('associatedtransaction', transaction);

			return transaction;

		})

	}

	hydrateSelectedCreditCard(){

		du.debug('Hydrate Selected CreditCard');

		let selected_creditcard = this.parameters.get('selectedcreditcard');

		if(_.has(selected_creditcard, 'number')){
			return true;
		}

		if(_.has(selected_creditcard, 'token')){

			return this.creditCardController.get({id: selected_creditcard.id, hydrate_token: true}).then(result => {

				if(_.isNull(result) || !_.has(result, 'number')){
					throw eu.getError('server', 'Unable to hydrate the selected creditcard');
				}

				this.appendCVV(result);
				this.parameters.set('selectedcreditcard', result);

				return true;

			});

		}

		throw eu.getError('server', 'Selected CreditCard must have either a number or a token.');

	}

	selectCustomerCreditCard(){

		du.debug('Select Customer Credit Card');

		let selected_creditcard = this.parameters.get('selectedcreditcard', {fatal: false});

		if(_.isNull(selected_creditcard)){

			let creditcards = this.parameters.get('creditcards');

			selected_creditcard = arrayutilities.reduce(
				creditcards,
				(selected_creditcard, creditcard) => {

					if(_.isNull(selected_creditcard)){
						return creditcard;
					}

					if(_.has(creditcard, 'default') && creditcard.default == true){
						return creditcard;
					}

					if(creditcard.updated_at > selected_creditcard.updated_at){
						return creditcard;
					}

					return selected_creditcard;

				},
				null
			);

			if(_.isNull(selected_creditcard)){
				throw eu.getError('server', 'Unable to set credit card for customer');
			}

		}

		this.appendCVV(selected_creditcard);

		this.parameters.set('selectedcreditcard', selected_creditcard);

		return Promise.resolve(true);

	}

	appendCVV(selected_creditcard){

		du.debug('selected_creditcard');

		let raw_creditcard = this.parameters.get('rawcreditcard', {fatal: false});

		if(_.has(raw_creditcard, 'cvv')){
			selected_creditcard.cvv = raw_creditcard.cvv;
		}

	}

	acquireCustomer(){

		du.debug('Acquire Customer');

		let parentsession  = this.parameters.get('parentsession');

		return this.customerController.get({id: parentsession.customer}).then(customer => {

			return this.parameters.set('customer', customer);

		});

	}

	acquireCustomerCreditCards(){

		du.debug('Acquire Customer Creditcard');

		let selected_creditcard = this.parameters.get('selectedcreditcard', {fatal: false});

		if(!_.isNull(selected_creditcard) && _.has(selected_creditcard, 'id')){
			return Promise.resolve(true);
		}

		let customer = this.parameters.get('customer');

		return this.customerController.getCreditCards(customer).then(creditcards => {
			if (creditcards === null) {
				throw eu.getError('server', 'Unable to find creditcards for customer');
			}

			return this.parameters.set('creditcards', creditcards);

		});

	}

	acquireMerchantProvider({id}){

		du.debug('Acquire Merchant Provider');

		return this.merchantProviderController.get({id: id}).then(result => {
			return result;

		});

	}

}
