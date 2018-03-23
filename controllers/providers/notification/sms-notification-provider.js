'use strict';
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities');

module.exports = class SMSNotificationProvider {

  constructor(){
    this.notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');
    this.sns = global.SixCRM.routes.include('lib', 'sns-utilities');
  }

  sendNotification(notification_object, phone_number) {

    du.debug('Send Notification');

    return this.notificationController.isValidNotification(notification_object).then(() => {

      let sms_body = this.formatSMSBody(notification_object);
      let sms_phone_number = this.getInternationalPhoneNumber(phone_number);

      return this.sns.sendSMS(sms_body, sms_phone_number);

    });

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
