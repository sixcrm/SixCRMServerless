const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class AccountDetailsController extends entityController {

	constructor() {

		super('accountdetail');

	}

}

module.exports = AccountDetailsController;
