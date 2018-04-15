

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

module.exports = class LeadNotification extends BaseNotification {

	constructor(){

		super();

		this.name = 'lead';
		this.context_required = ['campaign.name', 'customer.id'];
		this.category = 'transaction';

		this.account_wide = true;

	}

}

