
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const ShippingStatusController = global.SixCRM.routes.include('controllers', 'helpers/shippingcarriers/ShippingStatus.js');

module.exports = class confirmDeliveredController extends workerController {

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
			'transactions': global.SixCRM.routes.path('model', 'entities/components/transactions.json'),
			'shippedtransactionproducts': global.SixCRM.routes.path('model', 'workers/confirmDelivered/shippedtransactionproducts.json'),
			'shippingreceipts': global.SixCRM.routes.path('model', 'entities/components/shippingreceipts.json'),
			'productdeliveredstati': global.SixCRM.routes.path('model', 'workers/confirmDelivered/productdeliveredstati.json'),
			'rebilldeliveredstatus': global.SixCRM.routes.path('model', 'workers/confirmDelivered/rebilldeliveredstatus.json')
		};

		this.augmentParameters();

	}

	execute(message) {
		return this.preamble(message)
			.then(() => this.acquireTransactions())
			.then(() => this.acquireTransactionProducts())
			.then(() => this.acquireShippingReceipts())
			.then(() => this.acquireProductDeliveredStati())
			.then(() => this.setDeliveredStatus())
			.then(() => this.respond())
			.catch(error => {
				du.error(error);
				return super.respond('error', error.message);
			});

	}

	acquireTransactions() {
		let rebill = this.parameters.get('rebill');

		if (!_.has(this, 'rebillController')) {
			const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
			this.rebillController = new RebillController();
		}

		return this.rebillController.listTransactions(rebill)
			.then((result) => this.rebillController.getResult(result, 'transactions'))
			.then(transactions => {

				this.parameters.set('transactions', transactions);

				return true;

			});

	}

	acquireTransactionProducts() {
		let transactions = this.parameters.get('transactions');

		if (!_.has(this, 'transactionHelperController')) {
			const TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');

			this.transactionHelperController = new TransactionHelperController();
		}

		let transaction_products = this.transactionHelperController.getTransactionProducts(transactions);

		this.parameters.set('shippedtransactionproducts', transaction_products);

		return Promise.resolve(true);

	}

	acquireShippingReceipts() {
		let transaction_products = this.parameters.get('shippedtransactionproducts');

		if (!_.has(this, 'shippingReceiptController')) {
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		let shipping_receipt_promises = arrayutilities.map(transaction_products, transaction_product => {
			return this.shippingReceiptController.get({
				id: transaction_product.shipping_receipt
			});
		});

		return Promise.all(shipping_receipt_promises).then(shipping_receipts => {

			this.parameters.set('shippingreceipts', shipping_receipts);

			return true;

		});

	}

	acquireProductDeliveredStati() {
		let shipping_receipts = this.parameters.get('shippingreceipts');

		let delivered_stati = arrayutilities.map(shipping_receipts, (shipping_receipt) => {

			let shippingStatusController = new ShippingStatusController();

			return shippingStatusController.isDelivered({
				shipping_receipt: shipping_receipt
			});

		});

		return Promise.all(delivered_stati).then(delivered_stati => {

			this.parameters.set('productdeliveredstati', delivered_stati);

			return true;

		});

	}

	setDeliveredStatus() {
		let delivered_stati = this.parameters.get('productdeliveredstati');

		let delivered = arrayutilities.every(delivered_stati, (delivered_status) => {
			return delivered_status;
		});

		this.parameters.set('rebilldeliveredstatus', delivered);

		return Promise.resolve(true);

	}

	respond() {
		let delivered = this.parameters.get('rebilldeliveredstatus');

		let promise = () => Promise.resolve();

		if (delivered == true) {
			promise = () => this.pushEvent({
				event_type: 'delivery_confirmation'
			});
		}

		return promise()
			.then(() => {

				let response_code = (delivered == true) ? 'success' : 'noaction';

				return super.respond(response_code);

			});

	}

}
