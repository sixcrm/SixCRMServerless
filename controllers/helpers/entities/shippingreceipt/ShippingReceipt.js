
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class ShippingReceiptHelperController {

	constructor(){

		this.parameter_definition = {
			updateShippingReceipt:{
				required:{
					shippingreceipt:'shipping_receipt',
					shippingdetail:'detail',
					shippingstatus:'status'
				},
				optional:{
					trackingid: 'tracking_id',
					carrier: 'carrier'
				}
			},
			confirmStati: {
				required:{
					shippingreceiptids:'shipping_receipt_ids',
					shippingstatus:'shipping_status'
				},
				optional:{}
			}

		};

		this.parameter_validation = {
			'shippingreceipt': global.SixCRM.routes.path('model','entities/shippingreceipt.json'),
			'shippingreceipts': global.SixCRM.routes.path('model','entities/components/shippingreceipts.json'),
			'shippingreceiptids': global.SixCRM.routes.path('model','general/uuidv4list.json'),
			'shippingdetail': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/response/detail.json'),
			'shippingstatus': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/response/status.json'),
			'updatedshippingreceipt': global.SixCRM.routes.path('model', 'entities/shippingreceipt.json'),
			'trackingid': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/trackingid.json'),
			'carrier': global.SixCRM.routes.path('model', 'vendors/shippingcarriers/carrier.json'),
		};

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	getTrackingNumber(shipping_receipt, fatal){

		du.debug('Get Tracking Number');

		fatal = (_.isUndefined(fatal))?false:fatal;

		if(_.has(shipping_receipt, 'tracking')){
			return shipping_receipt.tracking.id;
		}

		if(fatal == true){
			throw eu.getError('server', 'Shipping Receipt missing property "trackingnumber"');
		}

		return null;

	}

	updateShippingReceipt(){

		du.debug('Update Shipping Receipt');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'updateShippingReceipt'}))
			.then(() => this.acquireShippingReceipt())
			.then(() => this.buildUpdatedShippingReceiptPrototype())
			.then(() => this.pushUpdatedShippingReceipt())
			.then(() => {
				return this.parameters.get('updatedshippingreceipt');
			});

	}

	acquireShippingReceipt(){

		du.debug('Acquire Shipping Receipt');

		let shipping_receipt = this.parameters.get('shippingreceipt');

		if(!_.has(this, 'shippingReceiptController')){
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		return this.shippingReceiptController.get({id: shipping_receipt.id}).then(shipping_receipt => {

			this.parameters.set('shippingreceipt', shipping_receipt);

			return true;

		});

	}

	pushUpdatedShippingReceipt(){

		du.debug('Push Updated Shipping Receipt');

		let updated_shipping_receipt = this.parameters.get('updatedshippingreceipt');

		if(!_.has(this, 'shippingReceiptController')){
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		return this.shippingReceiptController.update({entity: updated_shipping_receipt}).then(updated_shipping_receipt => {
			this.parameters.set('updatedshippingreceipt', updated_shipping_receipt);
			return true;
		});

	}

	buildUpdatedShippingReceiptPrototype(){

		du.debug('Build Updated Shipping Receipt Prototype');

		let shipping_receipt = this.parameters.get('shippingreceipt');
		let shipping_status = this.parameters.get('shippingstatus');
		let shipping_detail = this.parameters.get('shippingdetail');

		let tracking_id = this.parameters.get('trackingid', {fatal: false});
		let carrier = this.parameters.get('carrier', {fatal: false});

		shipping_receipt.status = shipping_status;

		let history_object = {
			created_at: timestamp.getISO8601(),
			detail: shipping_detail,
			status: shipping_status
		};

		if(!_.has(shipping_receipt, 'history')){
			shipping_receipt.history = [history_object];
		}else{
			shipping_receipt.history = arrayutilities.merge(shipping_receipt.history, [history_object]);
		}

		let tracking_prototype = (_.has(shipping_receipt, 'tracking'))?shipping_receipt.tracking:{};

		if(!_.isNull(tracking_id)){
			tracking_prototype.id = tracking_id;
		}

		if(!_.isNull(carrier)){
			tracking_prototype.carrier = carrier;
		}

		shipping_receipt.tracking = tracking_prototype;

		this.parameters.set('updatedshippingreceipt', shipping_receipt);

		return true;

	}

	confirmStati(){

		du.debug('Confirm Stati');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'confirmStati'}))
			.then(() => this.acquireShippingReceipts())
			.then(() => this.confirmShippingReceiptStati());

	}

	acquireShippingReceipts(){

		du.debug('Acquire Shipping Receipts');

		let shipping_receipt_ids = this.parameters.get('shippingreceiptids');

		if(!_.has(this, 'shippingReceiptController')){
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		return this.shippingReceiptController.getListByAccount({ids: shipping_receipt_ids}).then(result => {

			this.parameters.set('shippingreceipts', result.shippingreceipts);

			return true;

		});

	}

	confirmShippingReceiptStati(){

		du.debug('Confirm Shipping Receipt Stati');

		let shipping_receipts = this.parameters.get('shippingreceipts');
		let shipping_status = this.parameters.get('shippingstatus');

		if(!arrayutilities.nonEmpty(shipping_receipts)){ return null; }

		return arrayutilities.every(shipping_receipts, (shipping_receipt) => {

			if(shipping_receipt.status != shipping_status){ return false; }

			if(shipping_status == 'intransit'){

				if(!objectutilities.hasRecursive(shipping_receipt, 'tracking.id')){
					return false;
				}

				if(!objectutilities.hasRecursive(shipping_receipt, 'tracking.carrier')){
					return false;
				}

			}

			if(shipping_status == 'delivered'){

				if(!objectutilities.hasRecursive(shipping_receipt, 'tracking.id')){
					return false;
				}

				if(!objectutilities.hasRecursive(shipping_receipt, 'tracking.carrier')){
					return false;
				}

				if(!_.has(shipping_receipt, 'history')){
					return false;
				}

				let delivered = arrayutilities.find(shipping_receipt.history, history_element => {
					return history_element.status == shipping_status;
				})

				if(!objectutilities.isObject(delivered)){
					return false;
				}

			}

			return true;

		});

	}

	async listByCustomer({customer, pagination}) {

		du.debug('List By Customer');

		du.info('Technical Debt: not referenced - '+JSON.stringify(pagination));

		if (!_.has(this, 'sessionController')){
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		if (!_.has(this, 'rebillController')){
			const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
			this.rebillController = new RebillController();
		}

		if (!_.has(this, 'transactionController')){
			const TransactionController = global.SixCRM.routes.include('entities', 'Transaction.js');
			this.transactionController = new TransactionController();
		}

		if (!_.has(this, 'shippingReceiptController')){
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		const sessions = await this.sessionController.getSessionByCustomer(customer);

		if (sessions === null) {
			return {
				shippingreceipts: null,
				pagination: {
					count: 0,
					end_cursor: '',
					has_next_page: 'false',
					last_evaluated: ''
				}
			};
		}

		const session_rebills = await Promise.all(arrayutilities.map(sessions, async session => {
			const result = await this.rebillController.queryBySecondaryIndex({
				index_name: 'parentsession-index',
				field: 'parentsession',
				index_value: session.id
			});
			return result.rebills;
		}));
		const rebills = arrayutilities.filter(arrayutilities.flatten(session_rebills), rebill => !_.isNull(rebill));


		const rebill_transactions = await Promise.all(arrayutilities.map(rebills, async rebill => {
			const result = await this.transactionController.queryBySecondaryIndex({
				index_name: 'rebill-index',
				field: 'rebill',
				index_value: rebill.id
			});
			return result.transactions;
		}));
		const transactions = arrayutilities.filter(arrayutilities.flatten(rebill_transactions), transaction => !_.isNull(transaction));

		const transaction_products = arrayutilities.flatten(arrayutilities.map(transactions, transaction => transaction.products));
		const product_shipping_receipts = arrayutilities.flatten(arrayutilities.map(transaction_products, product => product.shipping_receipt));
		const shipping_receipt_ids = arrayutilities.unique(arrayutilities.filter(product_shipping_receipts, receipt => !_.isUndefined(receipt)));
		const shipping_receipts = await this.shippingReceiptController.batchGet({ids: shipping_receipt_ids});
		return {
			shippingreceipts: shipping_receipts,
			pagination: {
				count: shipping_receipts.length,
				end_cursor: '',
				has_next_page: 'false',
				last_evaluated: ''
			}
		};
	}
}
