const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class CleanupSessionController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {
		this.validateEvent(event);

		let session = await this.getSession(event.guid);

		if (session.consolidated === true) {
			return 'CONSOLIDATED';
		}

		let consolidated_rebill = await this.cleanupSession(session);

		await this.markAsConsolidated(session);

		return this.respond(consolidated_rebill);

	}

	async cleanupSession(session){
		let rebills = await this.getSessionRebills(session);

		if(_.isNull(rebills)){
			return null;
		}

		return this.consolidateRebills({session: session, rebills: rebills});

	}

	async getSessionRebills(session, fatal = true){
		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
			this.rebillController = new RebillController();
		}

		const rebills = await this.rebillController.listBySession({session: session});

		if(_.isNull(rebills) || !_.has(rebills, 'rebills')){
			du.warning('Unexpected response format: '+JSON.stringify(rebills), session);
			if(fatal == true){
				throw eu.getError('server', 'Unexpected response format: '+JSON.stringify(rebills));
			}
			return null;
		}

		if(!_.isArray(rebills.rebills) || !arrayutilities.nonEmpty(rebills.rebills)){
			return null;
		}

		return rebills.rebills;

	}

	async consolidateRebills({session, rebills}){
		if(rebills.length == 1){
			return rebills[0];
		}

		let products = [];
		let amount = 0.00;
		let product_schedules = [];
		let bill_at = timestamp.getISO8601();
		let merchant_provider;
		let merchant_provider_selections = [];

		arrayutilities.map(rebills, (rebill) => {

			if(rebill.bill_at < bill_at){
				bill_at = rebill.bill_at;
			}

			if(_.has(rebill, 'products')){
				products = arrayutilities.merge(products, rebill.products);
			}

			if(_.has(rebill, 'product_schedules')){
				product_schedules = arrayutilities.merge(product_schedules, rebill.product_schedules);
			}

			if(_.has(rebill, 'merchant_provider') && merchant_provider === undefined){
				merchant_provider = rebill.merchant_provider;
			}

			if(_.has(rebill, 'merchant_provider_selections')){
				merchant_provider_selections = arrayutilities.merge(merchant_provider_selections, rebill.merchant_provider_selections);
			}

			amount = (amount + (rebill.amount * 1));

		});

		merchant_provider_selections = _.uniqWith(merchant_provider_selections, _.isEqual);

		let entity = new RebillCreatorHelperController().createRebillPrototype({
			session,
			transaction_products: products,
			amount,
			product_schedules,
			merchant_provider,
			merchant_provider_selections,
			bill_at,
			processing: true
		});

		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
			this.rebillController = new RebillController();
		}

		let consolidated_rebill = await this.rebillController.create({entity: entity});

		await this.consolidateTransactions({consolidated_rebill: consolidated_rebill, rebills: rebills});

		await this.deleteUnusedRebills(rebills);

		return consolidated_rebill;

	}

	async consolidateTransactions({consolidated_rebill, rebills}){
		let consolidation_promises = arrayutilities.map(rebills, (rebill) => {
			return this.consolidateRebillTransactions({consolidated_rebill: consolidated_rebill, rebill: rebill});
		});

		await Promise.all(consolidation_promises);

		return true;

	}

	async deleteUnusedRebills(rebills){
		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
			this.rebillController = new RebillController();
		}

		let delete_promises = arrayutilities.map(rebills, rebill => {
			return this.rebillController.delete({id: rebill.id});
		});

		await Promise.all(delete_promises);

		return true;

	}

	async consolidateRebillTransactions({consolidated_rebill, rebill, fatal = true}){
		if(!_.has(rebill, 'id')){
			du.error(rebill);
			throw eu.getError('server', 'Rebill is assumed to have property "id"');
		}

		if(!_.has(consolidated_rebill, 'id')){
			du.error(consolidated_rebill);
			throw eu.getError('server', 'Consolidated Rebill is assumed to have property "id"');
		}

		if(!_.has(this, 'transactionController')) {
			const TransactionController = global.SixCRM.routes.include('entities', 'Transaction.js');
			this.transactionController = new TransactionController();
		}

		let transactions = await this.transactionController.listTransactionsByRebillID({id: rebill.id});

		if(_.isNull(transactions) || !_.has(transactions, 'transactions')){
			du.warning('Unexpected response format: '+JSON.stringify(transactions), rebill, consolidated_rebill);
			if(fatal == true){
				throw eu.getError('server', 'Unexpected response format: '+JSON.stringify(transactions));
			}
			return null;
		}

		if(!_.isArray(transactions.transactions) || !arrayutilities.nonEmpty(transactions.transactions)){
			return null;
		}

		let transaction_promises = arrayutilities.map(transactions.transactions, (transaction) => {
			transaction.rebill = consolidated_rebill.id;
			return this.transactionController.update({entity: transaction});
		});

		await Promise.all(transaction_promises);

		return true;

	}

	async markAsConsolidated(session) {
		if (!_.has(this, 'sessionController')) {
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		return this.sessionController.updateProperties({ id: session, properties: { consolidated: true } });
	}

	respond(rebill = null){
		if(_.isNull(rebill) || !_.has(rebill, 'id')){
			return 'NOREBILL';
		}

		return rebill.id;

	}

}
