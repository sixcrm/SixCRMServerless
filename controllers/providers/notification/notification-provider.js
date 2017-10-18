'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities');
const eu = global.SixCRM.routes.include('lib','error-utilities');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities');
const permissionUtils = global.SixCRM.routes.include('lib','permission-utilities');
const emailNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/email-notification-provider');
const smsNotificationUtils = global.SixCRM.routes.include('controllers','providers/notification/sms-notification-provider');
const slackNotificationUtils = global.SixCRM.routes.include('controllers','providers/notification/slack-notification-provider');
const timestamp = global.SixCRM.routes.include('lib','timestamp');

const notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification');
const notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting');
const userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting');
const userAclController = global.SixCRM.routes.include('controllers', 'entities/UserACL');

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
     * Send a test notification to current user.
     */
    test() {
        du.debug('Sending a test notification.');

        let notification_object = {
            account: global.account,
            user: global.user.id,
            type: 'dummy',
            action: 'test',
            title: 'A notification from SixCRM!',
            body: 'This is a test notification. Do you see it?'
        };

        return this.createNotificationForAccountAndUser(notification_object).then(() => {
            return 'OK';
        });
    }

    /**
     * Save given notification in the system, and send it though all channels, respecting user settings.
     */
    saveAndSendNotification(notification_parameters, account, user) {
        let notificationTypes = ['dummy']; // 'dummy' is used in helper utilities

        du.debug('Save and send notification.');

        //du.warning(user); process.exit();

        return Promise.all([
            notificationSettingController.get({id: user}), // notification settings
            userSettingController.get({id: user}), // user settings
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
                "body": notification_parameters.body
            };

            // If user does not want to receive 'six' notifications, or this type of notification, mark it as already read.
            if (!this.wantsToReceive('six', user_settings) || !_.contains(notificationTypes, notification_parameters.type)) {
                createNotification.read_at = timestamp.getISO8601();
            }

            du.debug('About to create notification', createNotification);

            return notificationController.create({entity: createNotification}).then((notification) => {

                du.debug('Saved notification', notification);

                let notificationSendOperations = [];

                // If user wanted to receive this type of notification.
                if (_.contains(notificationTypes, notification.type)) {

                    // If user wanted to receive through this channel.
                    if (this.wantsToReceive('email', user_settings)) {
                        let email_address = this.settingsDataFor('email', user_settings);

                        if (email_address) {
                            notificationSendOperations.push(emailNotificationProvider.sendNotificationViaEmail(notification, email_address));
                        }
                    }

                    if (this.wantsToReceive('sms', user_settings)){
                        let sms_number = this.settingsDataFor('sms', user_settings);

                        if (sms_number) {
                            notificationSendOperations.push(smsNotificationUtils.sendNotificationViaSms(notification, sms_number));
                        }
                    }

                    if (this.wantsToReceive('slack', user_settings)) {
                        let slack_webhook = this.settingsDataFor('slack', user_settings);

                        if (slack_webhook) {
                            notificationSendOperations.push(slackNotificationUtils.sendNotificationViaSlack(notification, slack_webhook));
                        }
                    }
                }

                return Promise.all(notificationSendOperations).then(() => {
                  return notification;
                });
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

        du.debug('Validate Create Notification Object');

        if (user_required && !_.has(create_notification_object, 'user')) {
            return eu.throwError('server','User is mandatory.');
        }

        let params = objectutilities.clone(create_notification_object);

        if(!_.has(params, 'body')){
          params.body = '(No Body)';
        }

        mvu.validateModel(params, global.SixCRM.routes.path('model','actions/create_notification.json'));

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

        return userAclController.queryBySecondaryIndex({field: 'account', index_value: account, index_name: 'account-index'}).then((userAcls) => {
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
