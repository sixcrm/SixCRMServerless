'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');
const mvu = global.SixCRM.routes.include('lib','model-validator-utilities.js');

module.exports = class NotificationUtilities {

  constructor(){

    const ContextHelperController = global.SixCRM.routes.include('helpers', 'context/Context.js');
    this.contextHelperController = new ContextHelperController();

  }

  getName(){

    du.debug('Get Name');

    if(_.has(this, 'name')){
      return this.name;
    }

    eu.throwError('server', 'Nameless notification, very cryptic.');

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

      mvu.validateModel(this.notification_type, global.SixCRM.routes.path('model', 'helpers/notifications/notificationtype.json'));

      return this.notification_type;

    }

    eu.throwError('server', 'Unable to determine notification type.');

  }

  getUserFromContext(context){

    du.debug('Get User From Context');

    let resolved_user = null;

    resolved_user = this.contextHelperController.getFromContext(context, 'user.id', 'id');

    if(_.isNull(resolved_user)){

      resolved_user = this.contextHelperController.getFromContext(context, 'user', 'email');

    }

    return resolved_user;

  }

  getAccountFromContext(context){

    du.debug('Get User From Context');

    let resolved_account = null;

    resolved_account = this.contextHelperController.getFromContext(context, 'account.id', 'id');

    if(_.isNull(resolved_account)){

      resolved_account = this.contextHelperController.getFromContext(context, 'account', 'id');

    }

    return resolved_account;

  }

  replaceFromContext(context, field){

    du.debug('Replace From Context');

    let replace_object = {};

    let tokens = parserutilities.getTokens(this[field]);

    if(arrayutilities.nonEmpty(tokens)){

      arrayutilities.map(tokens, token => {

        let token_value = this.contextHelperController.getFromContext(context, token, false);

        if(!_.isUndefined(token_value) && !_.isNull(token_value)){
          replace_object[token] = token_value;
        }

      });

    }

    let replaced = parserutilities.parse(this[field], replace_object, true);

    du.info(replaced);

    return replaced;

  }

}
