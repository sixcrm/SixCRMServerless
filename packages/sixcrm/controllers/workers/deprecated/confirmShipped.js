
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const ShippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');

/*

Technical Debt:

This must ask the fulfillment provider for the tracking number if it's not already on the shipping receipt
This needs to happen AFTER the shippinf receipt is acquired
Note, not all transaction_products will have shipping receipts -  many are no-ship.

*/

module.exports = class confirmShippedController extends workerController {

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
			'shippedtransactionproducts': global.SixCRM.routes.path('model', 'workers/confirmShipped/shippedtransactionproducts.json'),
			'shippingreceipts': global.SixCRM.routes.path('model', 'entities/components/shippingreceipts.json'),
			'productshippedstati': global.SixCRM.routes.path('model', 'workers/confirmShipped/productshippedstati.json'),
			'rebillshippedstatus': global.SixCRM.routes.path('model', 'workers/confirmShipped/rebillshippedstatus.json')
		};

		this.augmentParameters();

	}

	execute(message) {
		return this.preamble(message)
			.then(() => this.acquireTransactions())
			.then(() => this.acquireTransactionProducts())
			.then(() => this.acquireShippingReceipts())
			.then(() => this.findUntrackedShippingReceipts())
			.then(() => this.getTrackingInformation())
			.then(() => this.updateShippingReceipts())
			.then(() => this.confirmAllShipped())
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

	findUntrackedShippingReceipts() {
		let shipping_receipts = this.parameters.get('shippingreceipts');

		let untracked_shipping_receipts = arrayutilities.filter(shipping_receipts, shipping_receipt => {
			return !(objectutilities.hasRecursive(shipping_receipt, 'tracking.id') && objectutilities.hasRecursive(shipping_receipt, 'tracking.carrier'));
		});

		if (arrayutilities.nonEmpty(untracked_shipping_receipts)) {
			this.parameters.set('untrackedshippingreceipts', untracked_shipping_receipts);
		}

		return true;

	}

	getTrackingInformation() {
		let untracked_shipping_receipts = this.parameters.get('untrackedshippingreceipts', {fatal: false});

		if (!_.isNull(untracked_shipping_receipts)) {

			const TerminalController = global.SixCRM.routes.include('providers', 'terminal/Terminal.js');

			let get_tracking_promises = arrayutilities.map(untracked_shipping_receipts, untracked_shipping_receipt => {

				let terminalController = new TerminalController();

				return terminalController.info({
					shipping_receipt: untracked_shipping_receipt
				}).then(result => {
					return {
						shipping_receipt: untracked_shipping_receipt,
						terminal_response: result.getVendorResponse().orders[0]
					};
				});

			});

			return Promise.all(get_tracking_promises).then(results => {

				this.parameters.set('compoundshippingobjects', results);

				return true;

			});

		} else {

			du.info('No untracked shipping receipts.');

		}

		return true;

	}

	updateShippingReceipts() {
		let compound_shipping_objects = this.parameters.get('compoundshippingobjects', {fatal: false});

		if (!_.isNull(compound_shipping_objects)) {

			let update_promises = arrayutilities.map(compound_shipping_objects, compound_shipping_object => {

				let status = this.getStatus(compound_shipping_object.terminal_response);
				let detail = this.getDetail(compound_shipping_object.terminal_response);

				let update_parameters = {
					shipping_receipt: compound_shipping_object.shipping_receipt,
					detail: detail,
					status: status,
				}

				if (_.has(compound_shipping_object.terminal_response, 'tracking_number') && !_.isNull(compound_shipping_object.terminal_response.tracking_number)) {
					update_parameters.tracking_id = compound_shipping_object.terminal_response.tracking_number;
				}

				if (_.has(compound_shipping_object.terminal_response, 'carrier') && !_.isNull(compound_shipping_object.terminal_response.carrier)) {
					update_parameters.carrier = compound_shipping_object.terminal_response.carrier;
				}

				let shippingReceiptHelperController = new ShippingReceiptHelperController();

				return shippingReceiptHelperController.updateShippingReceipt(update_parameters);

			});

			return Promise.all(update_promises).then(() => {
				return true;
			});

		}

		du.info('No untracked shipping receipts to update.');

		return true;

	}

	getStatus(terminal_response) {
		if (_.has(terminal_response, 'tracking_number') && _.has(terminal_response, 'carrier')) {
			if (!_.isNull(terminal_response.tracking_number) && !_.isNull(terminal_response.carrier)) {
				return 'intransit'
			}
		}

		return 'pending';

	}

	getDetail(terminal_response) {
		if (_.has(terminal_response, 'tracking_number') && _.has(terminal_response, 'carrier')) {
			if (!_.isNull(terminal_response.tracking_number) && !_.isNull(terminal_response.carrier)) {
				return 'Received tracking number from Fulfillment Provider';
			}
		}

		return 'Pending a tracking number from Fulfillment Provider';

	}

	confirmAllShipped() {
		let untracked_shipping_receipts = this.parameters.get('untrackedshippingreceipts', {fatal: false});

		if (!_.isNull(untracked_shipping_receipts)) {

			let untracked_shipping_receipt_ids = arrayutilities.map(untracked_shipping_receipts, (untracked_shipping_receipt) => {
				return untracked_shipping_receipt.id
			});

			let shippingReceiptHelperController = new ShippingReceiptHelperController();

			return shippingReceiptHelperController.confirmStati({
				shipping_receipt_ids: untracked_shipping_receipt_ids,
				shipping_status: 'intransit'
			}).then(result => {

				this.parameters.set('rebillshippedstatus', result);

				return true;

			});

		}

		du.info('No untracked shipping receipts to confirm.');

		this.parameters.set('rebillshippedstatus', true);

		return true;

	}

	respond() {
		let shipped = this.parameters.get('rebillshippedstatus');

		let promise = () => Promise.resolve();

		if (shipped == true) {
			promise = () => this.pushEvent({
				event_type: 'shipping_confirmation'
			});
		}

		return promise()
			.then(() => {

				let response_code = (shipped == true) ? 'success' : 'noaction';

				return super.respond(response_code);

			});

	}

}
