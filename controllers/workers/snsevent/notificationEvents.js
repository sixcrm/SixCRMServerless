'use strict'

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const NotificationsHelperController = global.SixCRM.routes.include('helpers', 'notifications/Notification.js');
const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

class NotificationEventsController extends SNSEventController {

  constructor(){

    super();

    this.event_record_handler = 'triggerNotification';

  }

  triggerNotification(){

    du.debug('Trigger Notifications');

    return Promise.resolve()
    //Note:  Because compliant_event_types is not defined in this class, all events pass the checks here.
    .then(() => this.isCompliantEventType())
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

    return notificationsHelperController.executeNotifications({event_type: event_type, context: context});

  }

}

module.exports = new NotificationEventsController();
