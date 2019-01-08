const workerController = require('../../workers/components/worker');
const AccountHelperController = require('../../helpers/entities/account/Account');
const accountHelperController = new AccountHelperController();

module.exports = class LimitAccountController extends workerController {
	constructor() {
		super();
		this.permissionutilities.setGlobalAccount('3f4abaf6-52ac-40c6-b155-d04caeb0391f');
	}

	async execute(id) {
		return accountHelperController.limitAccount({ id });
	}
}
