

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

module.exports = class EmailFailNotification extends BaseNotification {

	constructor(){

		super();

		this.name = 'email_fail';
		this.context_required = ['smtp_provider.name', 'smtp_provider.id'];
		this.category = 'transaction';

		this.account_wide = true;

	}

}

