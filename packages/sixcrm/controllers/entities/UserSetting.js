
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;


//Technical Debt: Override the list method
//Technical Debt: May need to embelish this to account for multiple settings for multiple accounts
class UserSettingController extends entityController {

	constructor() {
		super('usersetting');
	}

	delete({id, range_key = null}) {
		if ((global.user.id !== id) && (global.account !== '*')) {
			throw eu.getError('server', `You are not allowed to delete the entity with id ${id}. ${global.user.id} ${global.account}`)
		}

		return super.delete({id, range_key})
	}

}

module.exports = UserSettingController;
