const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetTrackingInformationController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {
		this.validateEvent(event);

		let shipping_receipt = await this.getShippingReceipt(event.guid);

		let tracking = await this.getTrackingInformation(shipping_receipt);

		await this.updateShippingReceiptWithTrackingInformation({shipping_receipt: shipping_receipt, tracking: tracking});

		await this.sendShipmentConfirmedNotification(shipping_receipt);

		return this.codifyTrackingInformation(tracking);

	}

	async sendShipmentConfirmedNotification({shipping_receipt, tracking}){
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
		const TrackerController = global.SixCRM.routes.include('providers', 'tracker/Tracker.js');
		let trackerController = new TrackerController();

		let result = await trackerController.info({
			shipping_receipt: shipping_receipt
		});

		let vendor_response = result.getVendorResponse();

		if(!_.has(vendor_response, 'detail')){
			throw eu.getError('server', 'Expected tracker response to have property "detail".', vendor_response);
		}

		if(!_.has(vendor_response, 'status')){
			throw eu.getError('server', 'Expected tracker response to have property "status".', vendor_response);
		}

		return vendor_response;

	}

	async updateShippingReceiptWithTrackingInformation({shipping_receipt, tracking}){
		if(!_.has(this, 'shippingReceiptHelperController')){
			const ShippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');
			this.shippingReceiptHelperController = new ShippingReceiptHelperController();
		}

		du.info(tracking);
		await this.shippingReceiptHelperController.updateShippingReceipt({shipping_receipt: shipping_receipt, detail: tracking.detail, status: tracking.status});

		return true;

	}

	codifyTrackingInformation(tracking){
		return tracking.status.toUpperCase();

	}

}
