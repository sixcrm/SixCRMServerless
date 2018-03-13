'use strict'

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const NotificationsHelperController = global.SixCRM.routes.include('helpers', 'notifications/Notification.js');
const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

class NotificationEventsController extends SNSEventController {

  constructor(){

    super();

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
    .then(() => this.executeNotification())
    .catch(error => {
      du.error(error);
      return true;
    });

  }

  executeNotification(){

    du.debug('Execute Notification');

    let event_type = this.parameters.get('message').event_type;
    let context = this.parameters.get('message').context;

    let notificationsHelperController = new NotificationsHelperController();

    return notificationsHelperController.executeNotifications(event_type, context);

  }

}

module.exports = new NotificationEventsController();
