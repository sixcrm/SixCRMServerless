'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const NotificationUtilities = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/NotificationUtilities.js');

module.exports = class BaseNotification extends NotificationUtilities {

  constructor(){

    super();

    this.category = 'base';
    this.notification_type = 'notification';

  }

  createContext(){

    du.debug('Create Context');

    return {};

  }

  transformContext(context){

    du.debug('Transform Context');

    du.debug('Context:', context);

    let return_object = {
      name: this.getName(),
      user: this.getUserFromContext(context),
      account: this.getAccountFromContext(context),
      type: this.getNotificationType(),
      category: this.getNotificationCategory(),
      context: this.createContext(context)
    };

    return return_object;

  }

  //Entrypoint
  triggerNotifications(transformed_context){

    du.debug('Trigger Notifications');

    if(!_.has(this, 'notificationProvider')){
      this.notificationProvider = global.SixCRM.routes.include('providers', 'notification/Notification.js');
    }

    if(_.has(this, 'account_wide') && this.account_wide == true){
      return this.notificationProvider.createNotificationsForAccount({notification_prototype: transformed_context});
    }

    return this.notificationProvider.createNotificationForAccountAndUser({notification_prototype: transformed_context});

  }

}
