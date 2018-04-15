

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

module.exports = class TestNotification extends BaseNotification {

	constructor(){

		super();

		this.category = 'test';
		this.name = 'test';

	}

}

