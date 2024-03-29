const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const au = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');

//Technical Debt:  Need to either mark the rebill with the attempt number or update the method which checks the rebill for existing failed attempts (better idea.)
module.exports = class recoverBillingController extends workerController {

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
		return this.preamble(message)
			.then(() => this.hydrateSession())
			.then(() => this.process())
			.then(() => this.markRebill())
			.then(() => this.postProcessing())
			.then(() => this.respond())
			.catch((error) => {
				du.error(error);
				return super.respond('error', error.message);
			})

	}

	hydrateSession() {
		const rebill = this.parameters.get('rebill');

		if (!_.has(this.sessionController)) {
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();

		}

		return this.sessionController.get({
			id: rebill.parentsession
		}).then(session => {

			return this.parameters.set('session', session);

		});

	}

	//Technical Debt:  Merchant Provider is necessary in the context of a rebill
	process() {
		const rebill = this.parameters.get('rebill');

		const registerController = new RegisterController();

		return registerController.processTransaction({
			rebill: rebill
		}).then(response => {

			this.parameters.set('registerresponse', response);

			return Promise.resolve(true);

		});

	}

	postProcessing() {
		const transactions = this.parameters.get('transactions', {fatal: false});

		if (_.isNull(transactions) || !au.nonEmpty(transactions)) {
			return false;
		}

		return au.serialPromises(au.map(transactions, (transaction) => {

			if (transaction.type != 'sale' || transaction.result != 'success') {
				return false;
			}

			const merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			return merchantProviderSummaryHelperController.incrementMerchantProviderSummary({
				merchant_provider: transaction.merchant_provider,
				day: transaction.created_at,
				total: transaction.amount,
				type: 'recurring'
			});

		}));

	}

	markRebill() {
		const rebill = this.parameters.get('rebill');
		const registerResponseCode = this.parameters.get('registerresponse').getCode();

		if (registerResponseCode == 'decline') {

			rebill.second_attempt = true;

			if (!_.has(this, 'rebillController')) {
				const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
				this.rebillController = new RebillController();
			}

			return this.rebillController.update({
				entity: rebill
			}).then(result => {

				return this.parameters.set('rebill', result);

			});

		} else {

			return Promise.resolve();

		}

	}

	respond() {
		return super.respond(this.parameters.get('registerresponse').getCode());

	}

}
