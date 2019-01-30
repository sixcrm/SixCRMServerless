const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetRecoverDateController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {
		this.validateEvent(event);

		return timestamp.upcoming('Friday', 0, '3:00 PM');

	}

}
