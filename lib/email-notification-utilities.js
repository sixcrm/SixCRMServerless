'use strict';
//const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const ses = global.SixCRM.routes.include('lib', 'ses-utilities');

const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

class EmailNotificationUtilities {

    /**
     * Send a notification via email.
     *
     * @param notification_object
     * @param email_address
     * @returns {Promise}
     */
    sendNotificationViaEmail(notification_object, email_address) {

        du.debug('Validating notification before sending via email.');

        return notificationController.isValidNotification(notification_object).then(() => {
            du.debug(`Sending notification with ID ${notification_object.id} to ${email_address}.`);

            let email = {
                to: [email_address],
                subject: notification_object.body,
                body: { text: this.formatEmailBody(notification_object) },
                source: 'timothy.dalbey@sixcrm.com'
            };

            return ses.sendEmail(email);
        });
    }

    formatEmailBody(notification_object) {
        return `You received a notification with body "${notification_object.body}". Thanks for using SixCRM!`;
    }
}

module.exports = new EmailNotificationUtilities();
