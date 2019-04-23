const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');
const ShippoTracker = require('../../../lib/controllers/vendors/ShippoTracker').default;
const RebillController = require('../../entities/Rebill');
const TrialConfirmationHelper = require('../../../lib/controllers/helpers/entities/trialconfirmation/TrialConfirmation').default;
const FulfillmentProviderController = global.SixCRM.routes.include('controllers','entities/FulfillmentProvider.js');

module.exports = class GetTrackingInformationController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		this.validateEvent(event);

		let shipping_receipt = await this.getShippingReceipt(event.guid);

		let tracking = await this.getTrackingInformation(shipping_receipt);

		await this.updateShippingReceiptWithTrackingInformation({shipping_receipt: shipping_receipt, tracking: tracking});

		await this.sendShipmentConfirmedNotification({shipping_receipt: shipping_receipt, tracking: tracking});

		return tracking.status;

	}

	async getTrackingInformation(shipping_receipt) {

		const isTestShipment = await this.isIsuedByTestFulfillmentProvider(shipping_receipt);

		if (isTestShipment) {
			return {
				status: 'DELIVERED',
				detail: 'Your package has been delivered.'
			}
		}

		const shippoTracker = new ShippoTracker(global.SixCRM.configuration.site_config.shippo.apiKey);

		const result = await shippoTracker.track(shipping_receipt.tracking.carrier, shipping_receipt.tracking.id);

		if (!_.has(result, 'tracking_status.status') || !_.has(result, 'tracking_status.status_details')) {

			throw eu.getError('server', 'Unexpected tracker response', result);

		}

		return {
			status: result.tracking_status.status,
			detail: result.tracking_status.status_details
		};

	}

	async updateShippingReceiptWithTrackingInformation({shipping_receipt, tracking}) {

		if(!_.has(this, 'shippingReceiptHelperController')) {
			const ShippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');
			this.shippingReceiptHelperController = new ShippingReceiptHelperController();
		}

		du.info(tracking);

		await this.shippingReceiptHelperController.updateShippingReceipt({shipping_receipt: shipping_receipt, detail: tracking.detail, status: tracking.status});

		return true;

	}

	async sendShipmentConfirmedNotification({shipping_receipt, tracking}) {

		du.debug('Sending shipment confirmed notification', shipping_receipt, tracking);

		if(_.includes(['DELIVERED','TRANSIT'], tracking.status)) {

			if (_.has(shipping_receipt, 'rebill')) {

				const rebillController = new RebillController();
				const rebill = rebillController.get({id: shipping_receipt.rebill});

				du.debug('Shipment notification rebill', rebill);

				if (rebill) {

					const trialConfirmationHelper = new TrialConfirmationHelper();

					try {
						await trialConfirmationHelper.confirmTrialDelivery(rebill.parentsession);
					} catch (error) {
						du.info(`Ignoring trial confirmation, ${error.message}`);
					}

				}

			}

			if(!_.has(shipping_receipt, 'history') || !arrayutilities.nonEmpty(shipping_receipt.history)) {

				await this.pushEvent({
					event_type: 'shipping_confirmation',
					context: {
						shipping_receipt: shipping_receipt
					}
				});

				return true;

			}

			let previous_shipment_record = arrayutilities.find(shipping_receipt.history, history_element => {
				return(_.includes(['DELIVERED','TRANSIT'], history_element.status));
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

	async isIsuedByTestFulfillmentProvider(shipping_receipt) {
		const fulfillmentProviderController = new FulfillmentProviderController();

		const fulfillmentProvider = await fulfillmentProviderController.get({id: shipping_receipt.fulfillment_provider});

		return fulfillmentProvider.provider.name === 'Test';
	}

}
