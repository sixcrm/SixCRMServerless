

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;


//Technical Debt: Override the list method
//Technical Debt:  The create method must assure a user/account
module.exports = class NotificationSettingController extends entityController {

	constructor() {
		super('notificationsetting');
	}

	getDefaultProfile(){

		return Promise.resolve(global.SixCRM.routes.include('resources', 'notifications/default_notification_settings.json'));

	}

	delete({id, range_key = null}) {
		if ((global.user.id !== id) && (global.account !== '*')) {
			throw eu.getError('server', 'You are not allowed to delete the entity.')
		}

		return super.delete({id, range_key})
	}

}
