const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

module.exports = class ChannelNotification {

	isValidNotification(notification_object){

		du.debug('Is Valid Notification');

		global.SixCRM.validate(notification_object, global.SixCRM.routes.path('model', 'providers/notifications/translatednotification.json'));

		return true;

	}

	sendNotification(notification_object, notification_properties) {

		du.debug('Send Notification');

		return Promise.resolve()
			.then(() => this.isValidNotification(notification_object))
			.then(() => this.validateNotificationProperties(notification_properties))
			.then(() => {

				return this.resolveNotification(notification_object, notification_properties);

			});

	}

}
