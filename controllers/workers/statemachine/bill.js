const _ = require('lodash')

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
const rebillController = new RebillController();

const SessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
const sessionController = new SessionController();

const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js')

module.exports = class BillController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let rebill = await this.getRebill(event.guid);

		let register_result = await this.executeBilling(rebill);

		const transactions = register_result.getTransactions();
		if (transactions[0]) {
			rebill.merchant_provider = transactions[0].merchant_provider;
			await rebillController.update({entity: rebill});
		}

		await AnalyticsEvent.push('create_order_recurring', {
			rebill
		});

		let result = register_result.parameters.get('response_type');

		await this.fetchContextParameters(rebill, result).then((parameters) => this.pushEvent(parameters));

		await this.incrementMerchantProviderSummary(register_result);

		return this.respond(register_result, rebill);

	}

	async executeBilling(rebill){

		du.debug('Execute Billing');

		let result;

		try{

			const registerController = new RegisterController();
			result = await registerController.processTransaction({rebill: rebill});


		}catch(error){

			du.error('Error from Register Controller', error, rebill);
			throw eu.getError('server', 'Register Controller returned a error.');

		}

		return result;

	}

	async incrementMerchantProviderSummary(register_result){

		du.debug('Increment Merchant Provider Summary');

		const transactions = register_result.parameters.get('transactions', {fatal: false});

		if (_.isNull(transactions) || !arrayutilities.nonEmpty(transactions)) {
			return false;
		}

		let update_promises = arrayutilities.map(transactions, (transaction) => {

			if (transaction.type != 'sale' || transaction.result != 'success') {
				return false;
			}

			const merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			return () => {
				return merchantProviderSummaryHelperController.incrementMerchantProviderSummary({
					merchant_provider: transaction.merchant_provider,
					day: transaction.created_at,
					total: transaction.amount,
					type: 'recurring'
				});
			}

		});

		return arrayutilities.serial(update_promises);

	}

	async fetchContextParameters(rebill, processor_result) {
		let parameters = {};

		return sessionController.get({id: rebill.parentsession}).then((session) => {
			parameters.session = session;
			parameters.rebill = rebill;
			parameters.processor_result = processor_result;
			return Promise.all([
				sessionController.getCustomer(session).then((customer) => parameters.customer = customer),
				sessionController.getCampaign(session).then((campaign) => parameters.campaign = campaign)
			])}).then(() => parameters);
	}

	async pushEvent(parameters) {
		let event = {
			event_type: this.getEventType(parameters.processor_result),
			context: {
				campaign: parameters.campaign,
				session: parameters.session,
				customer: parameters.customer,
				creditcard: parameters.creditcard,
				rebill: parameters.rebill
			}
		};

		du.debug(`bill.js.pushEvent`, event);
		let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
		return new EventPushHelperController().pushEvent(event);
	}


	getEventType(result) {
		let event_type = 'allorders';

		if (result !== 'success') {
			du.debug('bill.js rebill result is not success:', result);
			event_type = 'decline';
		}

		du.debug('bill.js getEventType', event_type, result);
		return event_type;
	}

	respond(result, rebill){

		du.debug('Respond');

		let result_code = result.getCode();

		if(_.toLower(result_code) == 'success'){
			return 'SUCCESS';
		}

		if(_.toLower(result_code) == 'decline'){
			return 'DECLINE';
		}

		if(_.toLower(result_code) == 'harddecline'){
			return 'HARDDECLINE';
		}

		du.error(result, rebill);
		throw eu.getError('server', 'Unexpected response from Register: '+result.getCode());

	}

}
