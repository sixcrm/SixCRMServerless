const _ = require('lodash')

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

const SessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
const sessionController = new SessionController();

const CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
const creditCardController = new CreditCardController();

const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js')

module.exports = class BillController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {
		this.validateEvent(event);

		let rebill = await this.getRebill(event.guid);
		await this.createProductScheduleService(rebill.account);

		let register_result = await this.executeBilling(rebill);

		await AnalyticsEvent.push('create_order', {
			rebill,
			type: 'recurring'
		});

		let result = register_result.parameters.get('response_type');

		const transactions = register_result.getTransactions();
		await this.fetchContextParameters(rebill, result, transactions[0]).then((parameters) => this.pushEvent(parameters));

		try {
			await this.incrementMerchantProviderSummary(register_result);
		} catch(error) {
			du.warning(`Failed to increment summary for rebill ${rebill.id}`, error);
		}

		return this.respond(register_result, rebill);

	}

	async executeBilling(rebill){
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

	async fetchContextParameters(rebill, processor_result, transaction) {
		let session = await sessionController.get({id: rebill.parentsession});
		let parameters = {
			session,
			rebill,
			transaction,
			processor_result,
			customer: await sessionController.getCustomer(session),
			campaign: await sessionController.getCampaign(session)
		};

		if (transaction && transaction.creditcard) {
			parameters.creditcard = await creditCardController.get({id: transaction.creditcard});
		}

		return parameters;
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

		let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
		return new EventPushHelperController().pushEvent(event);
	}


	getEventType(result) {
		let event_type = 'allorders';

		if (result !== 'success') {
			event_type = 'decline';
		}

		return event_type;
	}

	respond(result, rebill){
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
