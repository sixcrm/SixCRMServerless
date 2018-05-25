const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/components/stepfunctionworker.js');

module.exports = class SendDeliveryNotificationController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let shipping_receipt = await this.getShippingReceipt(event.guid);

		this.pushEvent({
			event_type:'delivery_confirmation',
			context:{
				shipping_receipt: shipping_receipt
			}
		});

		return true;

	}

}
