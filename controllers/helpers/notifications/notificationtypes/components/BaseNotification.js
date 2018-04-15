
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const NotificationUtilities = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/NotificationUtilities.js');

module.exports = class BaseNotification extends NotificationUtilities {

  constructor(){

    super();

    this.category = 'base';
    this.notification_type = 'notification';

  }

  createContext(context){

    du.debug('Create Context');

    let refined_context = {};

    if(_.has(this, 'context_required') && arrayutilities.nonEmpty(this.context_required)){
      arrayutilities.map(this.context_required, context_required_element => {
        let acquired_element = this.contextHelperController.getFromContext(context, context_required_element, false);
        if(!_.isNull(acquired_element)){
          refined_context[context_required_element] = acquired_element;
        }else{
          du.error(context);
          eu.throwError('server','Unable to identify "'+context_required_element+'" from context.');
        }
      });
    }

    return refined_context;

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

    du.info('Transformed Context: ', return_object);

    return return_object;

  }

  //Entrypoint
  triggerNotifications(transformed_context){

    du.debug('Trigger Notifications');

    if(!_.has(this, 'notificationProvider')){
      const NotificationProvider = global.SixCRM.routes.include('providers', 'notification/Notification.js');
      this.notificationProvider = new NotificationProvider();
    }

    if(_.has(this, 'account_wide') && this.account_wide == true){
      return this.notificationProvider.createNotificationsForAccount({notification_prototype: transformed_context});
    }

    return this.notificationProvider.createNotificationForAccountAndUser({notification_prototype: transformed_context});

  }

}
