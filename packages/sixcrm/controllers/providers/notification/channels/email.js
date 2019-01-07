const _ = require('lodash');
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
const ChannelNotification = global.SixCRM.routes.include('providers', 'notification/components/ChannelNotification.js');

module.exports = class EmailNotificationProvider extends ChannelNotification {

	constructor(){

		super();

		this.systemmailer = new SystemMailer();

	}

	validateNotificationProperties(notification_properties){
		global.SixCRM.validate(notification_properties, global.SixCRM.routes.path('model','providers/notifications/channels/email/notificationproperties.json'));

		return true;

	}

	resolveNotification(notification_object, notification_properties) {
		let recepient = this.getRecepient(notification_properties);

		let email = {
			recepient_emails: [recepient.email],
			subject: notification_object.title,
			body: notification_object.body,
		};

		if(_.has(recepient,'name') && !_.isNull(recepient.name)){
			email.recepient_name = recepient.name;
		}

		return this.systemmailer.sendEmail(email);

	}

	getRecepient(notification_properties){
		let recepient = {
			email: null,
			name: null
		};

		if(_.isString(notification_properties) && stringutilities.isEmail(notification_properties)){
			recepient.email = notification_properties;
		}

		if(_.isObject(notification_properties) && _.has(notification_properties, 'email') && stringutilities.isEmail(notification_properties.email)){
			recepient.email = notification_properties.email;
		}

		if(_.isObject(notification_properties) && _.has(notification_properties, 'name') && _.isString(notification_properties.name)){
			recepient.name = notification_properties.name;
		}

		return recepient;

	}

}
