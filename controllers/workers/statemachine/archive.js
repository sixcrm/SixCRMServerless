const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/components/stepfunctionworker.js');

//const ShippingReceiptHelperController = global.SixCRM.routes.include('helpers', 'entities/shippingreceipt/ShippingReceipt.js');

module.exports = class ArchiveController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		if(!_.has(event, 'guid')){
			throw eu.getError('bad_request', 'Expected property "guid" in the event object');
		}

		if(!stringutilities.isUUID(event.guid)){
			throw eu.getError('bad_request', 'Expected property "guid" to be a UUIDV4');
		}

		return 'ARCHIVED';

	}

}
