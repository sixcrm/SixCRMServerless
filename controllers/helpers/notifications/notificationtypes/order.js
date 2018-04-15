
const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

module.exports = class OrderNotification extends BaseNotification {

	constructor(){

		super();

		this.name = 'order';
		this.context_required = ['campaign.name', 'session.id', 'transactionsubtype'];
		this.category = 'transaction';

		this.account_wide = true;

	}

}

