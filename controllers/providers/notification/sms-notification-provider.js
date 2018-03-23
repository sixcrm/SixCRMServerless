const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities');

module.exports = class SMSNotificationProvider {

  constructor(){

    this.sns = global.SixCRM.routes.include('lib', 'sns-utilities');

  }

  sendNotification(notification_object, phone_number) {

    du.debug('Send Notification');

    return Promise.resolve()
    .then(() => this.isValidNotification(notification_object))
    .then(() => {

      let sms_body = this.formatSMSBody(notification_object);
      let sms_phone_number = this.getInternationalPhoneNumber(phone_number);

      return this.sns.sendSMS(sms_body, sms_phone_number);

    });

  }

  isValidNotification(notification_object){

    du.debug('Is Valid Notification');

    mvu.validateModel(notification_object, global.SixCRM.routes.path('model', 'providers/notifications/translatednotification.json'));

    return true;

  }

  formatSMSBody(notification_object) {

    du.debug('Format SMS Body');

    return stringutilities.abbreviate(notification_object.body, 140);

  }

  getInternationalPhoneNumber(phone_number) {

    du.debug('Get International Phone Number');

    if (phone_number[0] === '+') {
      return phone_number
    } else {
      return '+1'+phone_number;
    }

  }

}
