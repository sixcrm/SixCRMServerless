'use strict';
const Validator = require('jsonschema').Validator;

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const mvu = global.routes.include('lib', 'model-validator-utilities.js');
const permissionUtils = global.routes.include('lib', 'permission-utilities.js');

const notificationController = global.routes.include('controllers', 'entities/Notification.js');
const userAclController = global.routes.include('controllers', 'entities/UserACL.js');

class NotificationUtilities {

    /**
	 * Create a notification for each user of the account.
	 *
     * @param create_notification_object
     * @returns {Promise}
     */
    createNotificationsForAccount(create_notification_object) {

        du.debug('Create Notifications For Account');

        du.debug(`Create notifications for users of account '${create_notification_object.account}'.`);

        return this.validateCreateNotificationObject(create_notification_object).then(() => {
            return this.getAccountUsers(create_notification_object.account);
        }).then((users) => {
            if (!users || users.length < 1) {
                return false;
            }

            let saveOperations = [];

            users.forEach(user => {

                let saveOperation = notificationController.create({
                    "user": user,
                    "account": create_notification_object.account,
                    "type": create_notification_object.type,
                    "action": create_notification_object.action,
                    "body": create_notification_object.body
                });

                saveOperations.push(saveOperation);
                du.debug(`Adding notification for user '${user}'.`);

            });

            return Promise.all(saveOperations).then((saveOperations) => {

                du.highlight('Notifications Created.');
                return saveOperations;

            });

        });

    }

    /**
	 * Crate notification for a specific user of the account.
	 *
     * @param create_notification_object
     * @returns {Promise}
     */
    createNotificationForAccountAndUser(create_notification_object) {

        du.debug('Create Notifications For Account and User');

        return this.validateCreateNotificationObject(create_notification_object, true).then(() => {

            du.debug(`Create notification for account '${create_notification_object.account}' and user '${create_notification_object.user}'.`);

            return notificationController.create({
                "user": create_notification_object.user,
                "account": create_notification_object.account,
                "type": create_notification_object.type,
                "action": create_notification_object.action,
                "body": create_notification_object.body
            }).then((response_object) => {
                du.highlight('Notification created.');
                return response_object;
            });

        });

    }

    /**
	 *
     * @param create_notification_object
	 * @param user_required Whether to require 'user' field in the notification object
     * @returns {Promise}
     */
    validateCreateNotificationObject(create_notification_object, user_required) {

        du.debug('Validate Input');

        if (user_required && !create_notification_object.user) {
            return Promise.reject(eu.getError('server','User is mandatory.'));
        }

        return Promise.resolve(
            mvu.validateModel(create_notification_object, global.routes.path('model', 'actions/create_notification.json')));

    }

    /**
	 * All users that have access to given account.
	 *
     * @param account
     * @returns {Promise.<Array>}
     */
    getAccountUsers(account) {

        du.debug('getAccountUsers');
		// figure out if ACL checks were enabled
        let aclsWereEnabled = !permissionUtils.areACLsDisabled();

        permissionUtils.disableACLs();

        return userAclController.queryBySecondaryIndex('account', account, 'account-index').then((userAcls) => {
        	// re-enable ACLs only if there were enabled before this method
            if (aclsWereEnabled) {
                permissionUtils.enableACLs();
            }

            if (userAcls) {
                return userAcls.map(acl => acl.user);
            } else {
                return [];
            }
        }).catch(() => {
            // re-enable ACLs only if there were enabled before this method
            if (aclsWereEnabled) {
                permissionUtils.enableACLs();
            }
        });
    }
}

module.exports = new NotificationUtilities();
