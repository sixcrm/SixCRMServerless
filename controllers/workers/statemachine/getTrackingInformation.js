const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/components/stepfunctionworker.js');

//const ShippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');

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

	}

	async getShippingReceipt(id){

		du.debug('Get Shipping Receipt');

	}

	async getTrackingInformation(shipping_receipt){

		du.debug('Get Tracking Information');

	}

	async updateShippingReceiptWithTrackingInformation({shipping_receipt, tracking}){

		du.debug('updateShippingReceiptWithTrackingInformation');

	}

	codifyTrackingInformation(tracking){

		du.debug('Codify Tracking Information');

		return 'DELIVERED';

	}

}
