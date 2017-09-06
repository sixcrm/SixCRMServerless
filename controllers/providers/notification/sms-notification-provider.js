'use strict';
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const sns = global.SixCRM.routes.include('lib', 'sns-utilities');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities');

const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

class SmsNotificationProvider {

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
        return stringutilities.abbreviate('SixCRM notification: "' + notification_object.title + '".', 140);
    }

    getInternationalPhoneNumber(phone_number) {
        if (phone_number[0] === '+') {
            return phone_number
        } else {
            return `+1${phone_number}`; // assuming USA
        }
    }

}

module.exports = new SmsNotificationProvider();
