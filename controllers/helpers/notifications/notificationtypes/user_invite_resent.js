

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

module.exports = class UserInviteResentNotification extends BaseNotification {

	constructor(){

		super();

		this.name = 'user_invite_resent';
		this.context_required = ['user.id', 'role.name', 'account.name'];
		this.category = 'account';

	}

}
