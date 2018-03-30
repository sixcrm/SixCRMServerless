const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
const ChannelNotification = global.SixCRM.routes.include('providers', 'notification/components/ChannelNotification.js');

module.exports = class EmailNotificationProvider extends ChannelNotification {

  constructor(){

    super();

    this.systemmailer = new SystemMailer();

  }

  validateNotificationProperties(notification_properties){

    du.debug('Validate Notification Properties');

    mvu.validateModel(notification_properties, global.SixCRM.routes.path('model','providers/notifications/channels/email/notificationproperties.json'));

    return true;

  }

  resolveNotification(notification_object, notification_properties) {

    du.debug('Resolve Notification');

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

    du.debug('Get Recepient');

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
