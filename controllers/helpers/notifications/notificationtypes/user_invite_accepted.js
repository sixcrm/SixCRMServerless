

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

module.exports = class UserInviteAcceptedNotification extends BaseNotification {

	constructor(){

		super();

		this.name = 'user_invite_accepted';
		this.context_required = ['user.id', 'role.name', 'account.name'];
		this.category = 'account';

		this.account_wide = true;

	}

}
