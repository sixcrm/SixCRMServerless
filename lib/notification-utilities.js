'use strict';
const _ = require('underscore');
const Validator = require('jsonschema').Validator;

const du = require('./debug-utilities');
const permissionUtils = require('../lib/permission-utilities');

const notificationController = require('../controllers/Notification');
const userAclController = require('../controllers/UserACL');

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
                    "message": create_notification_object.message
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
                "message": create_notification_object.message
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

        let schema;

        try{
            schema = require('../model/actions/create_notification.json');
        } catch(e){
            return Promise.reject(new Error('Unable to load validation schemas.'));
        }

        if (user_required && !create_notification_object.user) {
            return Promise.reject(new Error('User is mandatory.'));
        }

        let validation;
        let params = JSON.parse(JSON.stringify(create_notification_object || {}));

        try{
            let v = new Validator();

            validation = v.validate(params, schema);
        }catch(e){
            return Promise.reject(new Error('Unable to instantiate validator.'));
        }

        if(validation['errors'].length > 0) {
            let error = {
                message: 'One or more validation errors occurred.',
                issues: validation.errors.map(e => e.message)
            };

            return Promise.reject(error);
        }

        return Promise.resolve(params);

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