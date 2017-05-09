'use strict';
const _ = require('underscore');

const du = require('./debug-utilities');
const slack = require('../lib/slack-utilities');

const notificationController = require('../controllers/Notification');

class SlackNotificationUtilities {

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
        return `SixCRM notification: "${notification_object.message}".`;
    }


}

module.exports = new SlackNotificationUtilities();