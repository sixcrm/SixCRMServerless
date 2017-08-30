'use strict';
//const _ = require('underscore');

//Technical Debt:  This needs to be a helper.
//Technical Debt:  Use SMTP

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
//const ses = global.SixCRM.routes.include('lib', 'ses-utilities');
const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');

class EmailNotificationUtilities {

    /**
     * Send a notification via email.
     *
     * @param notification_object
     * @param email_address
     * @param username
     * @returns {Promise}
     */
    sendNotificationViaEmail(notification_object, recepient_email_address, recepient_name) {

        du.debug('Validating notification before sending via email.');

        return notificationController.isValidNotification(notification_object).then(() => {

            du.debug(`Sending notification with ID ${notification_object.id} to ${recepient_name} at ${recepient_email_address}.`);

            let email = {
                recepient_emails: [recepient_email_address],
                recepient_name: recepient_name,
                subject: notification_object.body,
                body: this.formatEmailBody(notification_object),
            };

            return systemmailer.sendEmail(email);

        });
    }

    formatEmailBody(notification_object) {
        return `You received a notification with body "${notification_object.body}". Thanks for using SixCRM!`;
    }
}

module.exports = new EmailNotificationUtilities();
