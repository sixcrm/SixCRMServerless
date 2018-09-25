const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class SendDeliveryNotificationController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('SendDeliveryNotificationController Execute', event);

		this.validateEvent(event);

		return true;

	}

};
