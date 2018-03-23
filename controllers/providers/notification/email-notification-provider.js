'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');


module.exports = class EmailNotificationProvider {

  constructor(){

    this.systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
    this.notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification.js');

  }

  sendNotification(notification_object, recepient_email_address, recepient_name) {

    du.debug('Send Notification');

    recepient_name = (_.isUndefined(recepient_name) || _.isNull(recepient_name))?null:recepient_name;

    return this.notificationController.isValidNotification(notification_object).then(() => {

      let email = {
          recepient_emails: [recepient_email_address],
          subject: notification_object.title,
          body: this.formatEmailBody(notification_object),
      };

      if(!_.isNull(recepient_name)){
        email.recepient_name = recepient_name;
      }

      return this.systemmailer.sendEmail(email);

    });

  }

  formatEmailBody(notification_object) {

    du.debug('Format Email Body');

    return notification_object.body;

  }

}
