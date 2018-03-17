'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const NotificationUtilities = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/NotificationUtilities.js');

module.exports = class BaseNotification extends NotificationUtilities {

  constructor(){

    super();

    this.title = 'Base Notification';
    this.body = 'This is the base notification.';
    this.category = 'base';
    this.notification_type = 'notification';

  }

  //Entrypoint
  transformContext(context){

    du.debug('Transform Context');

    let return_object = {
      user: this.getUserFromContext(context),
      account: this.getAccountFromContext(context),
      type: this.getNotificationType(),
      category: this.getNotificationCategory(),
      title: this.getTitle(context),
      body: this.getBody(context),
      action: {}
    };

    return return_object;

  }

  //Entrypoint
  triggerNotifications(transformed_context){

    du.debug('Trigger Notifications');

    if(!_.has(this, 'notificationProvider')){
      this.notificationProvider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
    }

    if(_.has(this, 'account_wide') && this.account_wide == true){
      return this.notificationProvider.createNotificationsForAccount(transformed_context);
    }

    return this.notificationProvider.createNotificationForAccountAndUser(transformed_context);

  }

}
