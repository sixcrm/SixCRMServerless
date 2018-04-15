

const BaseNotification = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/BaseNotification.js');

module.exports = class DefaultNotification extends BaseNotification{

	constructor(){

		super();

		this.name = 'default';

	}

}

