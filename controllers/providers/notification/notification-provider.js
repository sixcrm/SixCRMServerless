'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities');
const eu = global.SixCRM.routes.include('lib','error-utilities');
//const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');
//const timestamp = global.SixCRM.routes.include('lib','timestamp');

//const emailNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/email-notification-provider');
//const smsNotificationUtils = global.SixCRM.routes.include('controllers','providers/notification/sms-notification-provider');
//const slackNotificationUtils = global.SixCRM.routes.include('controllers','providers/notification/slack-notification-provider');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

class NotificationProvider {

  constructor(){

    this.immutable_categories = [];
    this.immutable_types = ['alert', 'persistent'];

    //Technical Debt:  Add action, notificationprototype
    this.parameter_validation = {};
    this.parameter_definition = {
      createNotificationForAccountAndUser:{
        required:{
          notificationprototype:'notification_prototype',
        },
        optional: {}
      },
      createNotificationsForAccount:{
        required:{
          notificationprototype:'notification_prototype',
        },
        optional: {}
      }
    };

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

    this.userACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');
    this.notificationController = global.SixCRM.routes.include('controllers', 'entities/Notification.js');
    this.notificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting.js');
    this.userSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting.js');

  }

  createNotificationsForAccount() {

    du.debug('Create Notifications For Account');

    let action = 'createNotificationsForAccount';
    this.parameters.set('action', action);

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: action}))
    .then(() => this.validateNotificationPrototype())
    .then(() => this.setReceiptUsers())
    .then(() => this.sendNotificationToUsers());

  }

  createNotificationForAccountAndUser() {

    du.debug('Create Notifications For Account and User');

    let action = 'createNotificationForAccountAndUser';
    this.parameters.set('action', action);

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: action}))
    .then(() => this.validateNotificationPrototype())
    .then(() => this.setReceiptUsers())
    .then(() => this.sendNotificationToUsers());

  }

  validateNotificationPrototype() {

    du.debug('Validate Notification Prototype');

    let action = this.parameters.get('action');
    let notification_prototype = this.parameters.get('notificationprototype');

    let user_required = false;
    if(action == 'createNotificationsForAccountAndUser'){
      user_required = true;
    }

    if (user_required && !_.has(notification_prototype, 'user')) {
      eu.throwError('server', 'User is mandatory in notification prototypes when using the createNotificationsForAccountAndUser method.');
    }

    return true;

  }

  setReceiptUsers(){

    du.debug('Set Receipt Users');

    let action = this.parameters.get('action');

    if(action == 'createNotificationsForAccount'){

      return this.setReceiptUsersFromAccount();

    }

    return this.setReceiptUsersFromNotificationPrototype();

  }

  setReceiptUsersFromNotificationPrototype(){

    du.debug('Set Receipt Users From Notification Prototype');

    let notification_prototype = this.parameters.get('notificationprototype');

    if(!_.has(notification_prototype, 'user')){
      eu.throwError('server', 'Unable to identify receipt user in notification prototype');
    }

    this.parameters.push('receiptusers', notification_prototype.user);

    return true;

  }

  setReceiptUsersFromAccount(){

    du.debug('Set Receipt Users From Account');

    let notification_prototype = this.parameters.get('notificationprototype');

    return this.userACLController.getACLByAccount({account: notification_prototype.account})
    .then((results) => {

      if(!arrayutilities.nonEmpty(results)){
        eu.throwError('server', 'Empty useracls element in account user_acl response');
      }

      arrayutilities.map(results, (user_acl_element) => {
        if(!_.has(user_acl_element, 'pending')){
          this.parameters.push('receiptusers', user_acl_element.user);
        }
      });

      return true;

    });

  }

  sendNotificationToUsers(){

    du.debug('Send Notification To Users');

    let receipt_users = this.parameters.get('receiptusers');
    let notification_prototype = this.parameters.get('notificationprototype');

    return arrayutilities.reduce(receipt_users, (current, receipt_user) => {
      return this.saveAndSendNotification({notification_prototype: notification_prototype, account: notification_prototype.account, user: receipt_user})
      .then(() => {
        return true;
      });
    }, true);

  }

  saveAndSendNotification({notification_prototype, account, user}) {

    du.debug('Save and Send Notification');

    return this.getNotificationSettings({user: user})
    .then((compound_notification_settings) => this.normalizeNotificationSettings(compound_notification_settings))
    .then(({normalized_notification_settings, user_settings}) => {

      return Promise.resolve()
      .then(() => this.buildNotificationCategoriesAndTypes(normalized_notification_settings))
      .then((augmented_normalized_notification_settings) => {

        return this.createNotification({
          notification_prototype: notification_prototype,
          user: user,
          account: account,
          augmented_normalized_notification_settings: augmented_normalized_notification_settings,
          user_settings: user_settings
        })
        .then(notification => {

          /*
          return this.sendNotificationToChannels({
            notification: notification,
            notification_settings: augmented_normalized_notification_settings
          });
          */

          return notification;

        });

      });

    });

  }

  getNotificationSettings({user}){

    du.debug('Get Notification Settings');

    let notification_preference_promises = [
      this.notificationSettingController.get({id: user}),
      this.userSettingController.get({id: user}),
      this.notificationSettingController.getDefaultProfile()
    ];

    return Promise.all(notification_preference_promises).then((notification_preference_promises) => {
      return {
        notification_settings: notification_preference_promises[0],
        user_settings: notification_preference_promises[1],
        default_notification_settings: notification_preference_promises[2],
      };
    });

  }

  normalizeNotificationSettings({notification_settings, default_notification_settings}){

    du.debug('Normalize Notification Settings');

    let normalized_notification_settings = default_notification_settings;
    let parsed_notification_settings = null;

    if(!_.isUndefined(notification_settings) && !_.isNull(notification_settings) && _.has(notification_settings, 'settings')){

      if(_.isString(notification_settings.settings)){

        try{
          parsed_notification_settings = JSON.parse(notification_settings.settings)
        }catch(error){
          eu.throwError(error);
        }

      }else if(_.isObject(notification_settings.settings)){

        parsed_notification_settings = notification_settings.settings;

      }else{

        eu.throwError('server', 'Unrecognized notification_settions.settings property.');

      }

    }

    if(!_.isNull(parsed_notification_settings)){
      normalized_notification_settings = normalized_notification_settings = objectutilities.recursiveMerge(parsed_notification_settings, normalized_notification_settings);
    }

    return normalized_notification_settings;

  }

  buildNotificationCategoriesAndTypes(notification_settings){

    du.debug('Build Notification Categories and Types');

    let notification_categories = this.immutable_categories;
    let notification_types = this.immutable_types;

    //Technical Debt:  Confirm and validate
    if(_.has(notification_settings, 'notification_groups') && _.isArray(notification_settings.notification_groups)){
      arrayutilities.map(notification_settings.notification_groups, (notification_group) => {
        if(_.has(notification_group, 'notifications')){
          arrayutilities.map(notification_group.notifications, notification => {
            if(_.has(notification, 'default') && _.has(notification, 'key') && notification.default == true){
              notification_categories.push(notification.key);
            }
          });
        }
      });
    }

    return {
      notification_settings: notification_settings,
      notification_categories: notification_categories,
      notification_types: notification_types
    };

  }

  createNotification({notification_prototype, user, account, /*augmented_normalized_notification_settings, user_settings*/}){

    du.debug('Create Notification Prototype');

    let transformed_notification_prototype = {
      user: user,
      account: account,
      type: notification_prototype.type,
      category: notification_prototype.category,
      context: notification_prototype.context,
      name: notification_prototype.name
    };

    /*
    Technical Debt: Validate...
    let six_notification_opt_in = this.getReceiveSettingForChannel('six', user_settings);
    let notification_category_opt_in = this.getNotificationCategoryOptIn(augmented_normalized_notification_settings);
    let notification_type_opt_in = this.getNotificationTypeOptIn(augmented_normalized_notification_settings);

    //validate this logic///
    if (six_notification_opt_in == false || notification_category_opt_in == false){
      if(notification_type_opt_in == false){
        notification_prototype.read_at = timestamp.getISO8601();
      }
    }
    */

    return this.notificationController.create({entity: transformed_notification_prototype});

  }

  getReceiveSettingForChannel(notification_channel, user_settings){

    du.debug('Get Receive Setting For Channel');

    let channel_settings = arrayutilities.find(user_settings.notifications, (notification_setting) => {
      return (notification_setting.name === notification_channel);
    });

    return (!_.isNull(channel_settings) && _.has(channel_settings, 'receive') && (channel_settings.receive == true));

  }

  /*
  Technical Debt:  Need to integrate notification translation.

  sendNotificationToChannels(){

    du.debug('Send Notification To Channels');

    let notification_channel_promises = [];

    if(this.userOptInCategory(notification) || this.userOptInType(notification)){

      notification_channel_promises.push(this.sendEmail());
      notification_channel_promises.push(this.sendSMS());
      notification_channel_promises.push(this.sendSlackMessage());

    }

    return Promise.all(notificationSendOperations).then(() => {
      return notification;
    });

  }

  userOptInCategory(){

    du.debug('User Opt-In Category');

    //if (_.contains(notificationCategoriesToSend, notification.category) || _.contains(notificationTypesToSend, notification.type)) {
    return true;

  }

  userOptInType(){

    du.debug('User Opt-In Type');

    //if (_.contains(notificationCategoriesToSend, notification.category) || _.contains(notificationTypesToSend, notification.type)) {
    return true;

  }

  sendEmail(user_settings){

    du.debug('Send Email');

    if(this.getReceiveSettingForChannel('email', user_settings)){

      let email_address = this.getNotificationChannelSettings('email', user_settings);

      if(email_address){
        return emailNotificationProvider.sendNotificationViaEmail(notification, email_address);
      }

    }

    return Promise.resolve(false);

  }

  sendSMS(){

    du.debug('Send SMS');

    if(this.getReceiveSettingForChannel('sms', user_settings)){

      let sms_number = this.getNotificationChannelSettings('sms', user_settings);

      if (sms_number) {
        return smsNotificationUtils.sendNotificationViaSms(notification, sms_number);
      }

    }

    return Promise.resolve(false);

  }

  sendSlackMessage(){

    du.debug('Send Slack Message');

    if(this.getReceiveSettingForChannel('slack', user_settings)) {

      let slack_webhook = this.getNotificationChannelSettings('slack', user_settings);

      if (slack_webhook) {
        return slackNotificationUtils.sendNotificationViaSlack(notification, slack_webhook);
      }

    }

    return Promise.resolve(false);

  }

  getNotificationChannelSettings(notification_channel, user_settings) {

    du.debug('Get Notification Channel Settings');

    let channel_settings = arrayutilities.find(user_settings.notifications, (notification_setting) => {
      return (notification_setting.name === notification_channel);
    });

    return channel_settings.data;

  }
  */

}

module.exports = new NotificationProvider();
