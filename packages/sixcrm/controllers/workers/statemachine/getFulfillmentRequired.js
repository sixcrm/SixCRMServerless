const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetFulfillmentRequiredController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {
		this.validateEvent(event);

		let rebill = await this.getRebill(event.guid);

		let transactions = await this.getRebillTransactions(rebill);

		let products = await this.getTransactionProducts(transactions);

		let noship = this.areProductsNoShip(products);

		return this.respond(noship);

	}

	async getRebillTransactions(rebill){
		if(!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities','Rebill.js');
			this.rebillController = new RebillController();
		}

		let transactions = await this.rebillController.listTransactions(rebill);

		if(_.isNull(transactions) || !_.has(transactions, 'transactions') || _.isNull(transactions.transactions) || !arrayutilities.nonEmpty(transactions.transactions)){
			throw eu.getError('server', 'There are no transactions associated with the rebill.', rebill);
		}

		return transactions.transactions;

	}

	async getTransactionProducts(transactions){
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
				du.error(product_promise, transactions);
				throw eu.getError('server', 'Unexpected result when retrieving transaction products: '+JSON.stringify(product_promise));
			}
			arrayutilities.map(product_promise, product => {

				if(_.isObject(product)){

					if(_.has(product, 'id')){

						//Technical Debt:  This structure may be incorrect.  Veryify.
						products.push(product);

					}else if(_.has(product, 'product') && _.has(product.product, 'id')){

						//Technical Debt:  This structure may be incorrect.  Veryify.
						products.push(product.product);

					}else{
						du.error(transactions);
						throw eu.getError('server', 'Unexpected result in array when retrieving transaction products: '+JSON.stringify(product));

					}

				}else{
					du.error(transactions);
					throw eu.getError('server', 'Unexpected result in array when retrieving transaction products: '+JSON.stringify(product));
				}
			});
		});

		if(!arrayutilities.nonEmpty(products)){
			du.error(transactions);
			throw eu.getError('server', 'There are no products associated with the transactions.');
		}

		products = arrayutilities.unique(products);

		return products;

	}

	areProductsNoShip(products){
		return arrayutilities.every(products, (product) => {
			return (product.ship == false);
		});

	}

	respond(no_ship){
		if(no_ship){
			return 'NOSHIP';
		}

		return 'SHIP';

	}

}
