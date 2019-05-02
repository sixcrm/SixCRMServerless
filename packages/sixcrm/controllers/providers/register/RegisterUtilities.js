
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const { getProductScheduleService } = require('@6crm/sixcrm-product-setup');

const PermissionedController = global.SixCRM.routes.include('helpers', 'permission/Permissioned.js');

const loadProductSchedule = async (id) => {
	try {
		return await getProductScheduleService().get(id);
	} catch (e) {
		du.error('Error retrieving product schedule', e);
		throw eu.getError('not_found', `Product schedule does not exist: ${id}`);
	}
}

module.exports = class RegisterUtilities extends PermissionedController {

	constructor(){

		super();

		const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

		this.rebillHelperController = new RebillHelperController();
	}

	async acquireRebillProperties(){
		const rebill = this.parameters.get('rebill');

		const parentSession = await this.rebillController.getParentSession(rebill);
		this.parameters.set('parentsession', parentSession);
		return true;
	}

	acquireRebill(){
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
		return this.validateRebillTimestamp()
			.then(() => this.validateAttemptRecord())
			.then(() => this.validateSession())
			.catch((error) => {
				du.error(error);
				return Promise.reject(error);
			});

	}

	validateSession(){
		let parentsession = this.parameters.get('parentsession');

		let day_in_cycle = this.rebillHelperController.calculateDayInCycle(parentsession.created_at);

		if(!_.isNumber(day_in_cycle) || day_in_cycle < 0){
			throw eu.getError('server', 'Invalid day in cycle returned for session.');
		}

		return Promise.resolve(true);

	}

	validateAttemptRecord(){
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
		let rebill = this.parameters.get('rebill');

		if(!this.rebillHelperController.isAvailable({rebill: rebill})){
			throw eu.getError('server', 'Rebill is not eligible for processing at this time.');
		}

		return Promise.resolve(true);

	}

	async acquireRebillSubProperties(){
		const rebill = this.parameters.get('rebill');
		const { watermark } = this.parameters.get('parentsession');
		const customer = await this.acquireCustomer();
		const creditcards = await this.acquireCustomerCreditCards(customer);
		const selected_creditcard = this.selectCustomerCreditCard();
		const hydrated_selected_creditcard = await this.hydrateSelectedCreditCard(selected_creditcard);
		const merchant_provider_groups = await this.acquireMerchantProviderGroups();

		let watermark_product_schedule;
		if (rebill.product_schedules && rebill.product_schedules.length) {
			watermark_product_schedule = watermark
				? watermark.product_schedules[0]
				: {
					product_schedule: await loadProductSchedule(
						rebill.product_schedules[0]
					),
					quantity: 1
				  };
		}

		return {
			customer,
			creditcards,
			selected_creditcard: hydrated_selected_creditcard,
			merchant_provider_groups,
			...(watermark_product_schedule ? { watermark_product_schedule} : {})
		};
	}

	async updateRebillMerchantProviderSelections() {
		const rebill = this.parameters.get('rebill');
		const merchant_provider_groups = this.parameters.get('merchantprovidergroups');
		rebill.merchant_provider_selections = Object.entries(merchant_provider_groups).reduce((result, [merchant_provider, product_groups]) => {
			const rebill_products = _.flatten(product_groups);
			const selections = rebill_products.map(({ product, productSchedule }) => ({
				...(product ? { product: product.id } : {}),
				...(productSchedule ? { productScheduleId: productSchedule.id } : {}),
				merchant_provider
			}));
			return result.concat(selections);
		}, []);
		return this.rebillController.update({ entity: rebill });
	}

	async acquireMerchantProviderGroups(){
		const rebill =  this.parameters.get('rebill');
		const creditcard = this.parameters.get('selectedcreditcard');

		if (_.has(rebill, 'merchant_provider_selections')) {
			const selections = rebill.merchant_provider_selections;

			du.info('acquireMerchantProviderGroups selections', selections);

			const merchant_provider_groups = selections.reduce((result, { merchant_provider, product: product_id }) => {
				const rebill_product = rebill.products.find(rebill_product => rebill_product.product.id === product_id);
				if (!rebill_product) {
					return result;
				}
				if (!_.has(result, merchant_provider)) {
					result[merchant_provider] = [[]];
				}
				result[merchant_provider][0].push(rebill_product);
				return result;
			}, {});

			du.info('acquireMerchantProviderGroups groups', merchant_provider_groups);

			this.parameters.set('merchantprovidergroups', merchant_provider_groups);
			return merchant_provider_groups;
		} else if (_.has(rebill, 'merchant_provider')) {
			const merchant_provider_groups = {};

			merchant_provider_groups[rebill.merchant_provider] = [rebill.products];

			this.parameters.set('merchantprovidergroups', merchant_provider_groups);
			return merchant_provider_groups;
		} else {
			const MerchantProviderSelectorHelperController = global.SixCRM.routes.include('helpers','transaction/MerchantProviderSelector.js');
			const merchantProviderSelectorHelperController = new MerchantProviderSelectorHelperController();

			const merchant_provider_groups = await merchantProviderSelectorHelperController.buildMerchantProviderGroups({rebill: rebill, creditcard: creditcard})
			du.debug(`Merchant provider groups: ${JSON.stringify(merchant_provider_groups)}`);
			this.parameters.set('merchantprovidergroups', merchant_provider_groups);
			await this.updateRebillMerchantProviderSelections();
			return merchant_provider_groups;
		}

	}

	hydrateTransaction(){
		let transaction = this.parameters.get('transaction');

		return this.transactionController.get({id: transaction, fatal: true}).then(transaction => {

			this.parameters.set('associatedtransaction', transaction);

			return transaction;

		})

	}

	async hydrateSelectedCreditCard(selected_creditcard) {
		if(_.has(selected_creditcard, 'number')){
			return selected_creditcard;
		}

		if(_.has(selected_creditcard, 'token')) {
			const hydratedCard = await this.creditCardController.get({id: selected_creditcard.id, hydrate_token: true});
			if(_.isNull(hydratedCard) || !_.has(hydratedCard, 'number')){
				throw eu.getError('server', 'Unable to hydrate the selected creditcard');
			}

			this.appendCVV(hydratedCard);
			this.parameters.set('selectedcreditcard', hydratedCard);
			return hydratedCard;
		}

		throw eu.getError('server', 'Selected CreditCard must have either a number or a token.');
	}

	selectCustomerCreditCard(){
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
		return selected_creditcard;
	}

	appendCVV(selected_creditcard){
		let raw_creditcard = this.parameters.get('rawcreditcard', {fatal: false});

		if(_.has(raw_creditcard, 'cvv')){
			selected_creditcard.cvv = raw_creditcard.cvv;
		}

	}

	async acquireCustomer(){
		const parentsession  = this.parameters.get('parentsession');

		const customer = await this.customerController.get({id: parentsession.customer});
		this.parameters.set('customer', customer);
		return customer;
	}

	async acquireCustomerCreditCards(customer) {
		const selected_creditcard = this.parameters.get('selectedcreditcard', {fatal: false});

		if(!_.isNull(selected_creditcard) && _.has(selected_creditcard, 'id')){
			return;
		}

		const creditcards = await this.customerController.getCreditCards(customer);
		if (creditcards === null) {
			throw eu.getError('server', 'Unable to find creditcards for customer');
		}

		this.parameters.set('creditcards', creditcards);
		return creditcards;
	}

	acquireMerchantProvider({id}){
		return this.merchantProviderController.get({id: id}).then(result => {
			return result;

		});

	}

}
