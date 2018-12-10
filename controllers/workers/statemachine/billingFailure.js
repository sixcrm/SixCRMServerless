//const _ = require('lodash')
const stepFunctionWorkerController = require('../../../controllers/workers/statemachine/components/stepFunctionWorker');
const AccountHelperController = require('../../../controllers/helpers/entities/account/Account');
const RebillController = require('../../../controllers/entities/Rebill');
const SessionController = require('../../../controllers/entities/Session');

const accountHelperController = new AccountHelperController();
const rebillController = new RebillController();
const sessionController = new SessionController();

module.exports = class BillingFailureController extends stepFunctionWorkerController {
	constructor() {
		super();
	}

	async execute(rebill_id) {
		// disabled until future release
		if (false) { // eslint-disable-line
			const rebill = await rebillController.get({id: rebill_id});
			if (rebill.account === '3f4abaf6-52ac-40c6-b155-d04caeb0391f') {
				const session = await sessionController.get({id: rebill.parentsession});
				const account = await accountHelperController.getAccountForCustomer(session.customer);
				await accountHelperController.scheduleDeactivation(account);
			}
		}
	}
}
