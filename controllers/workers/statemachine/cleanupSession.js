const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class CleanupSessionController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let session = await this.getSession(event.guid);

		let consolidated_rebill = await this.cleanupSession(session);

		return this.respond(consolidated_rebill);

	}

	async cleanupSession(session){

		du.debug('Cleanup Session');

		let rebills = await this.getSessionRebills(session);

		if(_.isNull(rebills)){
			return null;
		}

		return this.consolidateRebills({session: session, rebills: rebills});

	}

	async getSessionRebills(session, fatal = true){

		du.debug('Get Session Rebills');

		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
			this.rebillController = new RebillController();
		}

		const rebills = await this.rebillController.listBySession({session: session});

		if(_.isNull(rebills) || !_.has(rebills, 'rebills')){
			du.warning('Unexpected response format: '+JSON.stringify(rebills));
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

		du.debug('Consolidate Rebills');

		if(rebills.length == 1){
			return rebills[0];
		}

		let products = [];
		let amount = 0.00;
		let product_schedules = [];
		let bill_at = timestamp.getISO8601();

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

			amount = (amount + (rebill.amount * 1));

		});

		let entity = new RebillCreatorHelperController().createRebillPrototype({
			session: session,
			transaction_products: products,
			amount: amount,
			product_schedules: product_schedules,
			bill_at: bill_at
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

		du.debug('Consolidate Transactions');

		let consolidation_promises = arrayutilities.map(rebills, (rebill) => {
			return this.consolidateRebillTransactions({consolidated_rebill: consolidated_rebill, rebill: rebill});
		});

		await Promise.all(consolidation_promises);

		return true;

	}

	async deleteUnusedRebills(rebills){

		du.debug('Delete Unused Rebills');

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

		du.debug('Consolidate Rebill Transactions');

		if(!_.has(rebill, 'id')){
			throw eu.getError('server', 'Rebill is assumed to have property "id"');
		}

		if(!_.has(consolidated_rebill, 'id')){
			throw eu.getError('server', 'Consolidated Rebill is assumed to have property "id"');
		}

		if(!_.has(this, 'transactionController')) {
			const TransactionController = global.SixCRM.routes.include('entities', 'Transaction.js');
			this.transactionController = new TransactionController();
		}

		let transactions = await this.transactionController.listTransactionsByRebillID({id: rebill.id});

		if(_.isNull(transactions) || !_.has(transactions, 'transactions')){
			du.warning('Unexpected response format: '+JSON.stringify(transactions));
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

	respond(rebill = null){

		du.debug('Respond');

		if(_.isNull(rebill) || !_.has(rebill, 'id')){
			return 'NOREBILL';
		}

		return rebill.id;

	}

}
