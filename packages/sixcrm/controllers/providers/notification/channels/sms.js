const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;
const ChannelNotification = global.SixCRM.routes.include('providers', 'notification/components/ChannelNotification.js');
const SNSProvider = global.SixCRM.routes.include('controllers', 'providers/sns-provider.js');

module.exports = class SlackNotification extends ChannelNotification {

	constructor(){

		super();

		this.sns = new SNSProvider();

	}

	validateNotificationProperties(notification_properties){
		if(!stringutilities.isPhone(notification_properties)){
			throw eu.getError('server', 'notification_properties must be a valid phone number for Slack notifications');
		}

		return true;

	}

	resolveNotification(notification_object, notification_properties) {
		let sms_body = this.formatSMSBody(notification_object);
		let sms_phone_number = this.getInternationalPhoneNumber(notification_properties);

		return this.sns.sendSMS(sms_body, sms_phone_number);

	}

	formatSMSBody(notification_object) {
		return stringutilities.abbreviate(notification_object.body, 140);

	}

	//Technical Debt:  This function is overly terse.
	getInternationalPhoneNumber(phone_number) {
		if (phone_number[0] === '+') {
			return phone_number
		} else {
			return '+1'+phone_number;
		}

	}

}
