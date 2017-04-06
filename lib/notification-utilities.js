'use strict';
const _ = require('underscore');
const notificationController = require('../controllers/Notification');
const userAclController = require('../controllers/UserACL');
const du = require('./debug-utilities');

class NotificationUtilities {
	
	createNotificationsForAccount(notification_object) {
		du.debug('Create notifications for account.');

		// validate the notification object

		// determine users for the given account

		// save the notification for each user in the database

		return this.validateNotificationObject(notification_object).then((validation_result) => {
			if (!validation_result.valid) {
				throw new Error(validation_result.errors);
			} else {
                return this.usersOfAccount(notification_object.account);
            }
		}).then((users) => {
			if (users.length < 1) {
                return false;
			}

			let saveOperations = [];
			users.forEach(user => {
				let saveOperation = notificationController.create({
                    "user": user,
                    "account": notification_object.account,
                    "type": notification_object.type,
                    "action": notification_object.action,
                    "message": notification_object.message,
                    "created": Date.now()
				});

				saveOperations.push(saveOperation);
			});
			return Promise.all(saveOperations);
		});
	}

    createNotificationForAccountAndUser(notification_object) {
        du.debug('Create notification for account and user.');

        // validate the notification object

        // save the notification for user in the database

        return this.validateNotificationObject(notification_object, true).then((validation_result) => {
            if (!validation_result.valid) {
                throw new Error(validation_result.errors);
            } else {
                return notificationController.create({
                    "user": notification_object.user,
                    "account": notification_object.account,
                    "type": notification_object.type,
                    "action": notification_object.action,
                    "message": notification_object.message,
                    "created": Date.now()
                });
			}
        });
    }

    /**
	 * Determine whether the given object can be used for creating a valid notification.
	 *
     * @param notification_object
	 * @param userRequired Whether to require 'user' field in the notification object
     * @returns {Promise.<boolean>}
     */
	validateNotificationObject(notification_object, userRequired) {
		du.debug('Validate notification object');

		let validation_errors = [];
        let mandatoryFields = ['account', 'type', 'action', 'message'];

        if (userRequired) {
        	mandatoryFields.push('user');
		}

        mandatoryFields.forEach(field => {
			if (!_.has(notification_object, field) || !_.isString(notification_object[field])) {
				let message = `${field} is mandatory.`;
				validation_errors.push(message);
				du.debug(message);
            }
		});


		if (validation_errors.length > 0) {
			return Promise.resolve({valid: false, errors: validation_errors});
		} else {
			return Promise.resolve({valid: true});
		}
	}

    /**
	 * All users that have access to given account.
	 *
     * @param account
     * @returns {Promise.<Array>}
     */
	usersOfAccount(account) {
		return userAclController.listBySecondaryIndex('account', account, 'account-index')
			.then((userAcls) => userAcls ? userAcls.map(acl => acl.user) : []);
	}
}

module.exports = new NotificationUtilities();