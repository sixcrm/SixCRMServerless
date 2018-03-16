'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');

module.exports = class NotificationUtilities {

  constructor(){

    this.notificationProvider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');

    const ContextHelperController = global.SixCRM.routes.include('helpers', 'context/Context.js');

    this.contextHelperController = new ContextHelperController();

  }

  getNotificationCategory(){

    du.debug('Get Notification Category');

    if(_.has(this, 'category')){
      return this.category;
    }

    eu.throwError('server', 'Unable to determine notification category.');

  }

  getNotificationType(){

    du.debug('Get Notification Type');

    if(_.has(this, 'notification_type')){
      return this.notification_type;
    }

    eu.throwError('server', 'Unable to determine notification type.');

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
