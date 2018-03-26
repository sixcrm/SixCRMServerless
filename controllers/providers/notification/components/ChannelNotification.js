const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

module.exports = class ChannelNotification {

  isValidNotification(notification_object){

    du.debug('Is Valid Notification');

    mvu.validateModel(notification_object, global.SixCRM.routes.path('model', 'providers/notifications/translatednotification.json'));

    return true;

  }

  sendNotification(notification_object, notification_properties) {

    du.debug('Send Notification');

    return Promise.resolve()
    .then(() => this.isValidNotification(notification_object))
    .then(() => this.validateNotificationProperties(notification_properties))
    .then(() => {

      return this.resolveNotification(notification_object, notification_properties);

    });

  }

}
