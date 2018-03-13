'use strict'
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const ContextHelperController = global.SixCRM.routes.include('helpers', 'context/Context.js');
const NotificationUtilities = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/NotificationUtilities.js');

module.exports = class BaseNotification extends NotificationUtilities {

  constructor(){

    super();

    this.title = 'Base Notification';
    this.body = 'This is the base notification.';
    this.category = 'base';
    this.type = 'base';

    this.notificationProvider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
    this.contextHelperController = new ContextHelperController();

  }

  transformContext(context){

    du.debug('Transform Context');

    let return_object = {
      user: this.getUserFromContext(context),
      account: this.getAccountFromContext(context),
      type: this.getNotificationType(),
      category: this.getNotificationCategory(),
      title: this.getTitle(context),
      body: this.getBody(context)
    };

    return return_object;

  }

  triggerNotifications(transformed_context){

    du.debug('Trigger Notifications');

    if(_.has(this, 'account_wide') && this.account_wide == true){
      return this.notificationProvider.createNotificationsForAccount(transformed_context);
    }

    return this.notificationProvider.createNotificationsForAccountAndUser(transformed_context);

  }

  getUserFromContext(context){

    du.debug('Get User From Context');

    return this.contextHelperController.getFromContext(context, 'user', 'email');

  }

  getAccountFromContext(context){

    du.debug('Get User From Context');

    return this.contextHelperController.getFromContext(context, 'account');

  }

  getTitle(context){

    du.debug('Get Title');

    let replace_object = {};

    let tokens = parserutilities.getTokens(this.title);

    if(arrayutilities.nonEmpty(tokens)){

      arrayutilities.map(tokens, token => {

        let token_value = this.contextHelperController.getFromContext(context, token, false)

        if(!_.isUndefined(token_value) && !_.isNull(token_value)){
          replace_object[token] = token_value;
        }

      });

    }

    return parserutilities.parse(this.title, replace_object);

  }

  getBody(context){

    du.debug('Get Title');

    let replace_object = {};

    let tokens = parserutilities.getTokens(this.body);

    if(arrayutilities.nonEmpty(tokens)){

      arrayutilities.map(tokens, token => {

        let token_value = this.contextHelperController.getFromContext(context, token, false)

        if(!_.isUndefined(token_value) && !_.isNull(token_value)){
          replace_object[token] = token_value;
        }

      });

    }

    return parserutilities.parse(this.body, replace_object);

  }

}
