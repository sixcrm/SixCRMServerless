'use strict';
const du = global.SixCRM.routes.include('lib', 'debug-utilities');

module.exports = class SlackNotificationProvider {

  constructor(){

    this.notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');
    this.slack = global.SixCRM.routes.include('lib', 'slack-utilities');

  }

  sendNotification(notification_object, webhook) {

    du.debug('Send Notification');

    return this.notificationController.isValidNotification(notification_object).then(() => {
      return this.slack.sendMessageToWebhook(this.formatMessage(notification_object), webhook);
    });

  }

  formatMessage(notification_object) {

    du.debug('Format Message');

    return notification_object.title+"\n"+notification_object.body;

  }

}
