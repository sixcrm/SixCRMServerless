//const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
//const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
//const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
//const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/components/stepfunctionworker.js');

module.exports = class NotifyFulfillmentProvidersController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		return true;

	}

}
