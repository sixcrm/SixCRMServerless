const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/components/stepfunctionworker.js');

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

		if(!_.isNull(tracking) && _.has(tracking, 'id') && _.has(tracking, 'carrier')){

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

		return tracking_information.getVendorResponse();

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
