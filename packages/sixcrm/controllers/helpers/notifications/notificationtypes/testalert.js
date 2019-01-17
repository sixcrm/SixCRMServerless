

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

module.exports = class TestAlertNotification extends BaseNotification {

	constructor(){

		super();

		this.name = 'testalert';
		this.notification_type = 'alert';
		this.category = 'test';

	}

}
