

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

module.exports = class EmailFailNotification extends BaseNotification {

	constructor(){

		super();

		this.name = 'email_fail';
		this.context_required = ['smtpprovider.name', 'smtpprovider.id'];
		this.category = 'email';
		this.notification_type = 'alert';
		this.account_wide = true;

	}

}

