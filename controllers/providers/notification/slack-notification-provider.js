const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

module.exports = class SlackNotificationProvider {

  constructor(){

    this.slack = global.SixCRM.routes.include('lib', 'slack-utilities');

  }

  sendNotification(notification_object, webhook) {

    du.debug('Send Notification');

    return Promise.resolve()
    .then(() => this.isValidNotification(notification_object))
    .then(() => {

      let formatted_slack_notification = this.formatMessage(notification_object);

      return this.slack.sendMessageToWebhook(formatted_slack_notification, webhook);

    });

  }

  isValidNotification(notification_object){

    du.debug('Is Valid Notification');

    mvu.validateModel(notification_object, global.SixCRM.routes.path('model', 'providers/notifications/translatednotification.json'));

    return true;

  }

  //Technical Debt:  Improve this...
  formatMessage(notification_object) {

    du.debug('Format Message');

    return notification_object.title+"\n"+notification_object.body;

  }

}
