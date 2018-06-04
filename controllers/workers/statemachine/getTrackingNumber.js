const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetTrackingNumberController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let shipping_receipt = await this.getShippingReceipt(event.guid);

		let tracking_number = await this.getTrackingNumberByShippingReceipt(shipping_receipt);

		return this.respond(tracking_number);

	}

	async getTrackingNumberByShippingReceipt(shipping_receipt){

		du.debug('Get Tracking Number By Shipping Receipt');

		if(objectutilities.hasRecursive(shipping_receipt, 'tracking.id') && stringutilities.nonEmpty(shipping_receipt.tracking.id)){
			return shipping_receipt.tracking.id;
		}

		let tracking = await this.getTrackingInformationFromFulfillmentProvider(shipping_receipt);

		if(!_.isNull(tracking) && _.has(tracking, 'id')){

			if(!_.has(tracking, 'carrier') || _.isNull(tracking.carrier)){

				const ShippingCarrierHelperController = global.SixCRM.routes.include('helpers', 'shippingcarriers/ShippingCarrier.js');
				let shippingCarrierHelperController = new ShippingCarrierHelperController();

				let carriers = shippingCarrierHelperController.determineCarrierFromTrackingNumber(tracking.id);
				tracking.carrier = arrayutilities.compress(carriers,',','');

			}

			await this.updateShippingReceiptWithTrackingNumberAndCarrier({shipping_receipt: shipping_receipt, tracking: tracking});

			return tracking.id;

		}

		return null;

	}

	async getTrackingInformationFromFulfillmentProvider(shipping_receipt){

		du.debug('Get Tracking Information From Fulfillment Provider');

		const TerminalController = global.SixCRM.routes.include('providers','terminal/Terminal.js');
		let terminalController = new TerminalController();

		let tracking_information = await terminalController.info({shipping_receipt: shipping_receipt});

		if(tracking_information.getCode() !== 'success'){
			throw eu.getError('server', 'Terminal returned a non-success code: '+tracking_information.getCode())
		}

		let vendor_response = tracking_information.getVendorResponse();

		//Technical Debt:  Tracking can respond with several orders, and this logic only attains the first record
		if(objectutilities.hasRecursive(vendor_response, 'orders.0.shipping.tracking_number')){
			let return_object = {};
			return_object.id = vendor_response.orders[0].shipping.tracking_number;
			if(objectutilities.hasRecursive(vendor_response, 'orders.0.shipping.carrier') && !_.isNull(vendor_response.orders[0].shipping.carrier)){
				return_object.carrier = vendor_response.orders[0].shipping.carrier;
			}

			return return_object;

		}

		return null;

	}

	async updateShippingReceiptWithTrackingNumberAndCarrier({shipping_receipt, tracking}){

		du.debug('updateShippingReceiptWithTrackingNumber');

		shipping_receipt.tracking = {
			id: tracking.id,
			carrier: tracking.carrier
		};

		if(!_.has(this, 'shippingReceiptHelperController')){
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		await this.shippingReceiptController.update({entity: shipping_receipt});

		return true;

	}

	respond(tracking_number){

		du.debug('Respond');

		if(!_.isNull(tracking_number) && stringutilities.nonEmpty(tracking_number)){
			return tracking_number;
		}

		return 'NOTRACKING';

	}

}
