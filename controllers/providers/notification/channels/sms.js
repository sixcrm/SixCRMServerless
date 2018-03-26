const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities');
const ChannelNotification = global.SixCRM.routes.include('providers', 'notification/components/ChannelNotification.js');

module.exports = class SlackNotification extends ChannelNotification {

  constructor(){

    super();

    this.sns = global.SixCRM.routes.include('lib', 'sns-utilities');

  }

  validateNotificationProperties(notification_properties){

    du.debug('Validate Notification Properties');

    if(!stringutilities.isPhone(notification_properties)){
      eu.throwError('server', 'notification_properties must be a valid phone number for Slack notifications');
    }

    return true;

  }

  resolveNotification(notification_object, notification_properties) {

    du.debug('Resolve Notification');

    let sms_body = this.formatSMSBody(notification_object);
    let sms_phone_number = this.getInternationalPhoneNumber(notification_properties);

    return this.sns.sendSMS(sms_body, sms_phone_number);

  }

  formatSMSBody(notification_object) {

    du.debug('Format SMS Body');

    return stringutilities.abbreviate(notification_object.body, 140);

  }

  //Technical Debt:  This function is overly terse.
  getInternationalPhoneNumber(phone_number) {

    du.debug('Get International Phone Number');

    if (phone_number[0] === '+') {
      return phone_number
    } else {
      return '+1'+phone_number;
    }

  }

}
