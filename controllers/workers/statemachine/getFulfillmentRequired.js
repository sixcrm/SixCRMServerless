const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetFulfillmentRequiredController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let rebill = await this.getRebill(event.guid);

		let transactions = await this.getRebillTransactions(rebill);

		let products = await this.getTransactionProducts(transactions);

		let noship = this.areProductsNoShip(products);

		return this.respond(noship);

	}

	async getRebillTransactions(rebill){

		du.debug('Get Rebill Transactions');

		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities','Rebill.js');
			this.rebillController = new RebillController();
		}

		let transactions = await this.rebillController.listTransactions(rebill);

		if(_.isNull(transactions) || !_.has(transactions, 'transactions') || _.isNull(transactions.transactions) || !arrayutilities.nonEmpty(transactions.transactions)){
			throw eu.getError('server', 'There are no transactions associated with the rebill.');
		}

		return transactions.transactions;

	}

	async getTransactionProducts(transactions){

		du.debug('Get Transaction Products');

		if(!_.has(this, 'transactionController')){
			const TransactionController = global.SixCRM.routes.include('entities','Transaction.js');
			this.transactionController = new TransactionController();
		}

		let product_promises = arrayutilities.map(transactions, transaction => {
			return this.transactionController.getProducts(transaction);
		});

		product_promises = await Promise.all(product_promises);

		let products = [];

		arrayutilities.map(product_promises, product_promise => {
			if(!_.isArray(product_promise)){
				throw eu.getError('server', 'Unexpected result when retrieving transaction products: '+JSON.stringify(product_promise));
			}
			arrayutilities.map(product_promise, product => {
				if(_.isObject(product) && _.has(product, 'id')){
					products.push(product);
				}else{
					throw eu.getError('server', 'Unexpected result in array when retrieving transaction products: '+JSON.stringify(product));
				}
			});
		});

		if(!arrayutilities.nonEmpty(products)){
			throw eu.getError('server', 'There are no products associated with the transactions.');
		}

		products = arrayutilities.unique(products);

		return products;

	}

	areProductsNoShip(products){

		du.debug('Are Products No Ship');

		return arrayutilities.every(products, (product) => {
			return (product.ship == false);
		});

	}

	respond(no_ship){

		du.debug('Respond');

		if(no_ship){
			return 'NOSHIP';
		}

		return 'SHIP';

	}

}
