const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetTrackingNumberController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {
		this.validateEvent(event);

		let shipping_receipt = await this.getShippingReceipt(event.guid);

		let tracking_number = await this.getTrackingNumberByShippingReceipt(shipping_receipt);

		return this.respond(tracking_number);

	}

	async getTrackingNumberByShippingReceipt(shipping_receipt){
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
		const TerminalController = global.SixCRM.routes.include('providers','terminal/Terminal.js');
		let terminalController = new TerminalController();

		let tracking_information = await terminalController.info({shipping_receipt: shipping_receipt});

		if(tracking_information.getCode() !== 'success'){
			throw eu.getError('server', 'Terminal returned a non-success code: '+tracking_information.getCode())
		}

		let vendor_response = tracking_information.getVendorResponse();

		du.debug('Received Fulfillment Provider Response:', vendor_response);

		//Technical Debt:  Tracking can respond with several orders, and this logic only attains the first record
		if(objectutilities.hasRecursive(vendor_response, 'orders.0.shipping.tracking_number') && !!vendor_response.orders[0].shipping.tracking_number){
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
		if(!_.isNull(tracking_number) && stringutilities.nonEmpty(tracking_number)){
			return tracking_number;
		}

		return 'NOTRACKING';

	}

}
