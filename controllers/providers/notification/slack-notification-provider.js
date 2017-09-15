'use strict';
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const slack = global.SixCRM.routes.include('lib', 'slack-utilities');

const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

class SlackNotificationProvider {

    /**
     * Send a notification via Slack Webhook.
     *
     * @param notification_object
     * @param webhook
     * @returns {Promise}
     */
    sendNotificationViaSlack(notification_object, webhook) {

        du.debug('Validating notification before sending via Slack.');

        return notificationController.isValidNotification(notification_object).then(() => {
            du.debug(`Sending notification with ID ${notification_object.id} to ${webhook}.`);

            return slack.sendMessageToWebhook(this.formatMessage(notification_object), webhook);
        });
    }

    formatMessage(notification_object) {
        return `SixCRM notification: "${notification_object.title}".`;
    }


}

module.exports = new SlackNotificationProvider();
