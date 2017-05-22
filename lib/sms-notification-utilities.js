'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities');
const sns = global.routes.include('lib', 'sns-utilities');

const notificationController = global.routes.include('controllers', 'entities/Notification');

class SmsNotificationUtilities {

    /**
     * Send a notification via SMS.
     *
     * @param notification_object
     * @param phone_number
     * @returns {Promise}
     */
    sendNotificationViaSms(notification_object, phone_number) {

        du.debug('Validating notification before sending via SMS.');

        return notificationController.isValidNotification(notification_object).then(() => {
            du.debug(`Sending notification with ID ${notification_object.id} to ${phone_number}.`);

            return sns.sendSMS(this.formatSmsBody(notification_object), phone_number);
        });
    }

    formatSmsBody(notification_object) {
        // Technical Debt: make sure this fits in 140 characters.
        return `SixCRM notification: "${notification_object.body}".`;
    }

}

module.exports = new SmsNotificationUtilities();
