'use strict';
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

            return sns.sendSMS(this.formatSmsBody(notification_object), this.getInternationalPhoneNumber(phone_number));
        });
    }

    formatSmsBody(notification_object) {
        // Technical Debt: make sure this fits in 140 characters.
        return `SixCRM notification: "${notification_object.body}".`;
    }

    getInternationalPhoneNumber(phone_number) {
        if (phone_number[0] === '+') {
            return phone_number
        } else {
            return `+1${phone_number}`; // assuming USA
        }
    }

}

module.exports = new SmsNotificationUtilities();
