//const _ = require('lodash')

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetRecoverDateController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		return timestamp.upcoming('Friday', 0, '3:00 PM');

	}

}
