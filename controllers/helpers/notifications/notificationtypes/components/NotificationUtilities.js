'use strict'
const _ = require('underscore');

const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib','string-utilities.js');
const mvu = global.SixCRM.routes.include('lib','model-validator-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');

module.exports = class NotificationUtilities {

  constructor(){

  }

  getNotificationCategory(){

    if(_.has(this, 'category')){
      return this.category;
    }

    eu.throwError('server', 'Unable to determine notification category.');

  }

  getNotificationType(){

    if(_.has(this, 'notification_type')){
      return this.notifcation_type;
    }

    eu.throwError('server', 'Unable to determine notification type.');

  }

  getFromContext(context, field, type){

    du.debug('Get From Context');

    type = (_.isUndefined(type) || _.isNull(type))?'id':type;

    let discovered = objectutilities.recurseByDepth(context, (key, value) => {

      if(key == field){

        if(type == false){
          return true;
        }

        if(type == 'email'){
          if(_.isString(value) && stringutilities.isEmail(value)){
            return true;
          }
        }

        if(type == 'id'){
          if(_.isString(value)){
            if(mvu.validateModel(value, global.SixCRM.routes.path('model','definitions/sixcrmidentifier.json'), null, false)){
              return true;
            }
          }
        }

        if(type == 'object'){
          if(_.isObject(value)){
            return true;
          }
        }

      }

      return false;

    });

    if(discovered){
      return discovered;
    }

    eu.throwError('server', 'Unable to determine '+field+' from context.');

  }

}
