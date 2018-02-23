'use strict'
//const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
//const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

class NotificationsController extends SNSEventController {

  constructor(){

    super();

    this.parameter_definition = {};

    this.parameter_validation = {};

    this.augmentParameters();

  }

  handleEventRecord(record){

    du.debug('Handle Event Record');

    return Promise.resolve()
    .then(() => this.parameters.set('record', record))
    .then(() => this.getMessage())
    .then(() => this.triggerNotification())
    .then(() => this.cleanUp());

  }

  triggerNotification(){

    du.debug('Trigger Notifications');

    return Promise.resolve()
    .then(() => this.isComplaintEventType())
    .then(() => this.assembleNotificationObject())
    .then(() => this.executeNotification())
    .catch(error => {
      du.error(error);
      return true;
    });

  }

  assembleNotificationObject(){

    du.debug('Assemble Notification Object');

    let notification_object = {};

    this.parameters.set('notificationobject', notification_object);

    return true;

  }

  executeNotification(){

    du.debug('Execute Notification');

    let context = this.parameters.get('message').context;
    let notification_object = this.parameters.get('notificationobject');

    let notificationProviderController = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');

    return notificationProviderController.createNotificationsForAccount(notification_object, context);

  }

}

module.exports = new NotificationsController();
