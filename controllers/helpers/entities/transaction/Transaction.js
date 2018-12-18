const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const numberutilities = require('@6crm/sixcrmcore/util/number-utilities').default;
const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js')
const TransactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');

module.exports = class TransactionHelperController {

	constructor() {

		this.parameter_definition = {
			markTransactionChargeback: {
				required: {
					transactionid: 'transactionid',
					chargebackstatus: 'chargeback_status'
				},
				optional: {}
			},
			updateTransactionProducts: {
				required: {
					transactionid: 'transaction_id',
					updatedtransactionproducts: 'updated_transaction_products'
				},
				optional: {}
			}
		};

		this.parameter_validation = {
			'transactionid': global.SixCRM.routes.path('model', 'definitions/uuidv4.json'),
			'transaction': global.SixCRM.routes.path('model', 'entities/transaction.json'),
			'chargebackstatus': global.SixCRM.routes.path('model', 'helpers/transaction/chargeback.json'),
			'updatedtransactionproducts': global.SixCRM.routes.path('model', 'helpers/entities/transaction/updatedtransactionproducts.json')
		};

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({
			validation: this.parameter_validation,
			definition: this.parameter_definition
		});

		this.transactionController = new TransactionController();

	}

	getTransactionProducts(transactions, ignore_failed = true) {
		let transaction_products = [];

		arrayutilities.map(transactions, transaction => {
			if (_.has(transaction, 'products') && transaction.type === 'sale' && (transaction.result === 'success' || ignore_failed)) {
				arrayutilities.map(transaction.products, transaction_product => {
					transaction_products.push(transaction_product);
				});
			}
		});

		return transaction_products;

	}

	markTransactionChargeback() {
		return Promise.resolve(true)
			.then(() => this.parameters.setParameters({
				argumentation: arguments[0],
				action: 'markTransactionChargeback'
			}))
			.then(() => this.acquireTransaction())
			.then(() => this.setChargebackStatus())
			.then(() => this.updateTransaction())
			.then(() => AnalyticsEvent.push('chargeback', { transaction: this.parameters.get('transaction', {fatal: false})}))
			.then(() => {
				return this.parameters.get('transaction');
			})

	}

	acquireTransaction() {
		let transaction_id = this.parameters.get('transactionid');

		return this.transactionController.get({
			id: transaction_id
		}).then(transaction => {

			if (_.isNull(transaction)) {
				throw eu.getError('notfound', 'Transaction not found.');
			}

			this.parameters.set('transaction', transaction);
			return true;

		});

	}

	setChargebackStatus() {
		let chargeback_status = this.parameters.get('chargebackstatus');
		let transaction = this.parameters.get('transaction');

		transaction.chargeback = chargeback_status;

		this.parameters.set('transaction', transaction);

		return true;

	}

	updateTransaction() {
		let transaction = this.parameters.get('transaction');

		return this.transactionController.update({
			entity: transaction
		}).then(transaction => {
			this.parameters.set('transaction', transaction);
			return true;
		});

	}

	updateTransactionProducts() {
		du.info(arguments[0]);

		return Promise.resolve()
			.then(() => this.parameters.setParameters({
				argumentation: arguments[0],
				action: 'updateTransactionProducts'
			}))
			.then(() => this.acquireTransaction())
			.then(() => this.updateTransactionProductsPrototype())
			.then(() => this.updateTransaction())
			.then(() => {
				return this.parameters.get('transaction');
			});

	}

	updateTransactionProductsPrototype() {
		let transaction = this.parameters.get('transaction');
		let updated_transaction_products = this.parameters.get('updatedtransactionproducts');

		let missed_transaction_products = arrayutilities.filter(updated_transaction_products, updated_transaction_product => {

			let found_product = arrayutilities.find(transaction.products, (transaction_product_group, index) => {

				if (transaction_product_group.product.id == updated_transaction_product.product && transaction_product_group.amount == updated_transaction_product.amount) {

					transaction.products[index].shipping_receipt = updated_transaction_product.shipping_receipt;

					return true;

				}

				return false;

			});

			if (_.isNull(found_product) || _.isUndefined(found_product)) {
				return true;
			}

			return false;

		});

		if (arrayutilities.nonEmpty(missed_transaction_products)) {

			throw eu.getError('server', 'Unaccounted for transaction products in update.');

		}

		this.parameters.set('transaction', transaction);

		return true;

	}

	getDistributionBySKU({
		products
	}) {
		let grouped_products = arrayutilities.group(products, (product) => {
			return product.sku;
		});

		objectutilities.map(grouped_products, (sku) => {
			grouped_products[sku] = grouped_products[sku].length;
		});

		return grouped_products;

	}

	getTransactionsAmount(transactions) {
		return arrayutilities.reduce(transactions, (sum, transaction) => {
			return (sum + numberutilities.toNumber(transaction.amount));
		}, 0.0);

	}

}
