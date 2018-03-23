const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

module.exports = class EmailNotificationProvider {

  constructor(){

    this.systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

  }

  sendNotification(notification_object, recepient_email_address, recepient_name) {

    du.debug('Send Notification');

    return Promise.resolve()
    .then(() => this.isValidNotification(notification_object))
    .then(() => {

      recepient_name = (_.isUndefined(recepient_name) || _.isNull(recepient_name))?null:recepient_name;

      let email = {
          recepient_emails: [recepient_email_address],
          subject: notification_object.title,
          body: notification_object.body,
      };

      if(!_.isNull(recepient_name)){
        email.recepient_name = recepient_name;
      }

      return this.systemmailer.sendEmail(email);

    });

  }

  isValidNotification(notification_object){

    du.debug('Is Valid Notification');

    mvu.validateModel(notification_object, global.SixCRM.routes.path('model', 'providers/notifications/translatednotification.json'));

    return true;

  }

}
