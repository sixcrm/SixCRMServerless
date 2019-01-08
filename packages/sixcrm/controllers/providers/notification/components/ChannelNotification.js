module.exports = class ChannelNotification {

	isValidNotification(notification_object){
		global.SixCRM.validate(notification_object, global.SixCRM.routes.path('model', 'providers/notifications/translatednotification.json'));

		return true;

	}

	sendNotification(notification_object, notification_properties) {
		return Promise.resolve()
			.then(() => this.isValidNotification(notification_object))
			.then(() => this.validateNotificationProperties(notification_properties))
			.then(() => {

				return this.resolveNotification(notification_object, notification_properties);

			});

	}

}
