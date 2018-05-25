const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/components/stepfunctionworker.js');

module.exports = class GetTrackingInformationController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let shipping_receipt = await this.getShippingReceipt(event.guid);

		let tracking = await this.getTrackingInformation(shipping_receipt);

		await this.updateShippingReceiptWithTrackingInformation({shipping_receipt: shipping_receipt, tracking: tracking});

		return this.codifyTrackingInformation(tracking);

	}

	validateEvent(event){

		du.debug('Validate Event');

		du.info(event);

		if(!_.has(event, 'guid')){
			throw eu.getError('bad_request', 'Expected property "guid" in the event object');
		}

		if(!stringutilities.isUUID(event.guid)){
			throw eu.getError('bad_request', 'Expected property "guid" to be a UUIDV4');
		}

		return event;

	}

	async getShippingReceipt(id){

		du.debug('Get Shipping Receipt');

		if(!_.has(this, 'shippingReceiptController')){
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		let shipping_receipt = await this.shippingReceiptController.get({id: id});

		if(_.isNull(shipping_receipt)){
			throw eu.getError('server', 'Unable to acquire a shipping receipt that matches '+id);
		}

		return shipping_receipt;

	}

	async getTrackingInformation(shipping_receipt){

		du.debug('Get Tracking Information');

		const TrackerController = global.SixCRM.routes.include('providers', 'tracker/Tracker.js');
		let trackerController = new TrackerController();

		let result = await trackerController.info({
			shipping_receipt: shipping_receipt
		});

		return result.getVendorResponse();

	}

	async updateShippingReceiptWithTrackingInformation({shipping_receipt, tracking}){

		du.debug('updateShippingReceiptWithTrackingInformation');

		if(!_.has(this, 'shippingReceiptHelperController')){
			const ShippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');
			this.shippingReceiptHelperController = new ShippingReceiptHelperController();
		}

		await this.shippingReceiptHelperController.updateShippingReceipt({shipping_receipt: shipping_receipt, detail: tracking.detail, status: tracking.status});

		return true;

	}

	codifyTrackingInformation(tracking){

		du.debug('Codify Tracking Information');

		return tracking.status.toUpperCase();

	}

}
