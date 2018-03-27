const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

//Technical Debt:  Need to either mark the rebill with the attempt number or update the method which checks the rebill for existing failed attempts (better idea.)
module.exports = class processBillingController extends workerController {

	constructor() {

		super();

		this.parameter_definition = {
			execute: {
				required: {
					message: 'message'
				},
				optional: {}
			}
		};

		this.parameter_validation = {
			session: global.SixCRM.routes.path('model', 'entities/session.json'),
			registerresponsecode: global.SixCRM.routes.path('model', 'general/response/responsetype.json')
		};

		this.augmentParameters();

	}

	execute(message) {

		du.debug('Execute');

		return this.preamble(message)
			.then(() => this.hydrateSession())
			.then(() => this.process())
			.then(() => this.postProcessing())
			.then(() => this.respond())
			.catch((ex) => {

				du.error('ProcessBillingController.execute()', ex);
				return super.respond('error', ex.message);

			})

	}

	hydrateSession() {

		du.debug('Set Session');

		let rebill = this.parameters.get('rebill');

		if (!_.has(this.sessionController)) {

			this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');

		}

		return this.sessionController.get({
			id: rebill.parentsession
		}).then(session => {

			return this.parameters.set('session', session);

		});

	}

	//Technical Debt:  Merchant Provider is necessary in the context of a rebill
	process() {

		du.debug('Process');

		let rebill = this.parameters.get('rebill');

		const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');
		let registerController = new RegisterController();

		return registerController.processTransaction({
			rebill: rebill
		}).then(response => {

			this.parameters.set('registerresponse', response);

			return Promise.resolve(true);

		});

	}

	postProcessing() {

		du.debug('Post Processing');

		let register_response = this.parameters.get('registerresponse');
		let transactions = register_response.parameters.get('transactions', null, false);

		if (_.isNull(transactions) || !arrayutilities.nonEmpty(transactions)) {
			return false;
		}

		const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');

		return arrayutilities.serial(transactions, (current, transaction) => {

			this.pushEvent({
				event_type: 'transaction_' + transaction.result
			});

			if (transaction.type != 'sale' || transaction.result != 'success') {
				return false;
			}

			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			return merchantProviderSummaryHelperController.incrementMerchantProviderSummary({
				merchant_provider: transaction.merchant_provider,
				day: transaction.created_at,
				total: transaction.amount,
				type: 'recurring'
			});

		}, Promise.resolve());

	}

	respond() {

		du.debug('Respond');

		let register_response_code = this.parameters.get('registerresponse').getCode();

		return super.respond(register_response_code);

	}

}