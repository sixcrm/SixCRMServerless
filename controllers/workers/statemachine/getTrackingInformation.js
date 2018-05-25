const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
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

		await this.sendShipmentConfirmedNotification(shipping_receipt);

		return this.codifyTrackingInformation(tracking);

	}

	async sendShipmentConfirmedNotification({shipping_receipt, tracking}){

		du.debug('Send Shipment Confirmed Notification');

		if(_.includes(['delivered','intransit'], tracking.status)){

			if(!_.has(shipping_receipt, 'history') || !arrayutilities.nonEmpty(shipping_receipt.history)){

				await this.pushEvent({
					event_type: 'shipping_confirmation',
					context: {
						shipping_receipt: shipping_receipt
					}
				});

				return true;

			}

			let previous_shipment_record = arrayutilities.find(shipping_receipt.history, history_element => {
				return(_.includes(['delivered','intransit'], history_element.status));
			});

			if(_.isNull(previous_shipment_record) || _.isUndefined(previous_shipment_record)){

				await this.pushEvent({
					event_type: 'shipping_confirmation',
					context: {
						shipping_receipt: shipping_receipt
					}
				});

				return true;

			}



		}

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
