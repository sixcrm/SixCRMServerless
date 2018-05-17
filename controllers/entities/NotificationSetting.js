

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
//Technical Debt:  The create method must assure a user/account
module.exports = class NotificationSettingController extends entityController {

	constructor() {
		super('notificationsetting');
	}

	getDefaultProfile(){

		return Promise.resolve(global.SixCRM.routes.include('resources', 'notifications/default_notification_settings.json'));

	}

}
