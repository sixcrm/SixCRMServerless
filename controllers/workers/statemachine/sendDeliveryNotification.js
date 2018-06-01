//const _ = require('lodash')

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class SendDeliveryNotificationController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let shipping_receipt = await this.getShippingReceipt(event.guid);

		await this.pushEvent({
			event_type:'delivery_confirmation',
			context:{
				shipping_receipt: shipping_receipt
			}
		});

		return true;

	}

}
