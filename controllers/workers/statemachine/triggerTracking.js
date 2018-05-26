//const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
//const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
//const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/components/stepfunctionworker.js');

module.exports = class TriggerTrackingController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		du.info(event);

	}

}
