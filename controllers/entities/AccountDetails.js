const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class AccountDetailsController extends entityController {

	constructor() {

		super('accountdetails');

	}

}

module.exports = AccountDetailsController;
