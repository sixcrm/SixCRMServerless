'use strict';
const _ = require('underscore');
const Validator = require('jsonschema').Validator;

const du = require('../../../lib/debug-utilities');
const permissionUtils = require('../../../lib/permission-utilities');
const emailNotificationUtils = require('../../../lib/email-notification-utilities');
const smsNotificationUtils = require('../../../lib/sms-notification-utilities');
const slackNotificationUtils = require('../../../lib/slack-notification-utilities');
const timestamp = require('../../../lib/timestamp');

const notificationController = require('../../Notification');
const notificationSettingController = require('../../NotificationSetting');
const userSettingController = require('../../UserSetting');
const userAclController = require('../../UserACL');

class NotificationProvider {

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

                du.debug('No users found of account ' + create_notification_object.account);

                return false;
            }

            let saveOperations = [];

            users.forEach(user => {

                let saveOperation = this.saveAndSendNotification(
                    create_notification_object,
                    create_notification_object.account,
                    user
                );

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

            return this.saveAndSendNotification(
                create_notification_object,
                create_notification_object.account,
                create_notification_object.user
            ).then((response_object) => {
                du.highlight('Notification created.');
                return response_object;
            });

        });

    }

    /**
     * Save given notification in the system, and send it though all channels, respecting user settings.
     */
    saveAndSendNotification(notification_parameters, account, user) {
        let notificationTypes = ['dummy']; // 'dummy' is used in helper utilities

        du.debug('Save and send notification.');

        return Promise.all([
            notificationSettingController.get(user), // notification settings
            userSettingController.get(user), // user settings
            notificationSettingController.getDefaultProfile(), // default user settings
        ]).then((settings) => {

            let notification_settings = null;

            if (settings[0] && settings[0].settings) {
                notification_settings = JSON.parse(settings[0].settings);
            }

            let user_settings = settings[1];

            if (!user_settings) {
                du.error(`No user settings exist for user '${user}'`);
                return;
            }

            let default_notification_settings = settings[2];

            // If no valid notification settings exist use defaults.
            if (!notification_settings || !notification_settings.notification_groups) {
                notification_settings = default_notification_settings;
            }

            // Gather notifications types that the user wanted to receive notification for.
            notification_settings.notification_groups.forEach((group) => {
                if (group && group.notifications) {
                    group.notifications.forEach((notification) => {
                        if (notification.default) {
                            notificationTypes.push(notification.key);
                        }
                    })
                } else {
                    du.warning('Notification group in unexpected format', group);
                }
            });

            let createNotification = {
                "user": user,
                "account": account,
                "type": notification_parameters.type,
                "action": notification_parameters.action,
                "title": notification_parameters.title,
                "message": notification_parameters.message
            };

            // If user does not want to receive 'six' notifications, or this type of notification, mark it as already read.
            if (!this.wantsToReceive('six', user_settings) || !_.contains(notificationTypes, notification_parameters.type)) {
                createNotification.read_at = timestamp.getISO8601();
            }

            du.debug('About to create notification', createNotification);

            return notificationController.create(createNotification).then((notification) => {

                du.debug('Saved notification', notification);

                let notificationSendOperations = [];

                // If user wanted to receive this type of notification.
                if (_.contains(notificationTypes, notification.type)) {

                    // If user wanted to receive through this channel.
                    if (this.wantsToReceive('email', user_settings)) {
                        let email_address = this.settingsDataFor('email', user_settings);

                        notificationSendOperations.push(emailNotificationUtils.sendNotificationViaEmail(notification, email_address));
                    }

                    if (this.wantsToReceive('sms', user_settings)){
                        let sms_number = this.settingsDataFor('sms', user_settings);

                        notificationSendOperations.push(smsNotificationUtils.sendNotificationViaSms(notification, sms_number));
                    }

                    if (this.wantsToReceive('slack', user_settings)) {
                        let slack_webhook = this.settingsDataFor('slack', user_settings);

                        notificationSendOperations.push(slackNotificationUtils.sendNotificationViaSlack(notification, slack_webhook));
                    }
                }

                return Promise.all(notificationSendOperations).then(() => notification);
            });
        });

    }

    /**
     * Whether user wants to receive messages through this channel.
     * @param notification_type_name Channel name ('six' | 'email' | 'sms' | 'slack' | 'skype' | 'ios')
     * @param user_settings
     */
    wantsToReceive(notification_type_name, user_settings) {
        let notification = user_settings.notifications.filter(notification => notification.name === notification_type_name)[0];

        du.highlight(notification);

        return notification && notification.receive;
    }

    /**
     * Settings data for the given name,
     * @param notification_type_name Channel name ('six' | 'email' | 'sms' | 'slack' | 'skype' | 'ios')
     * @param user_settings
     */
    settingsDataFor(notification_type_name, user_settings) {
        let notification = user_settings.notifications.filter(notification => notification.name === notification_type_name)[0];

        return notification.data;
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
            schema = require('../../../model/actions/create_notification.json');
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
                return userAcls.useracls.map(acl => acl.user);
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

module.exports = new NotificationProvider();