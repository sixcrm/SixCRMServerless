'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib','error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js')

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

class NotificationProvider {

  constructor(){

    this.immutable_categories = [];

    //Technical Debt:  These override the
    this.immutable_types = ['alert', 'persistent'];
    this.channel_providers = {};

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

          return this.sendNotificationToChannels({
            notification: notification,
            augmented_normalized_notification_settings: augmented_normalized_notification_settings,
            user_settings: user_settings
          });

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

  normalizeNotificationSettings({notification_settings, default_notification_settings, user_settings}){

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

    return {normalized_notification_settings: normalized_notification_settings, user_settings: user_settings};

  }

  buildNotificationCategoriesAndTypes(notification_settings){

    du.debug('Build Notification Categories and Types');

    let notification_categories = this.immutable_categories;

    //Technical Debt:  What's the purpose of this.  Can a user turn off notification types?
    let notification_types = this.immutable_types;

    //Technical Debt:  Confirm and validate
    if(_.has(notification_settings, 'notification_groups') && _.isArray(notification_settings.notification_groups)){
      arrayutilities.map(notification_settings.notification_groups, (notification_group) => {
        if(_.has(notification_group, 'key') && _.has(notification_group, 'default') && notification_group.default == true){
          notification_categories.push(notification_group.key);
        }
      });
    }

    notification_categories = arrayutilities.unique(notification_categories);
    notification_types = arrayutilities.unique(notification_types);

    return {
      notification_settings: notification_settings,
      notification_categories: notification_categories,
      notification_types: notification_types
    };

  }

  createNotification({notification_prototype, user, account, user_settings, augmented_normalized_notification_settings}){

    du.debug('Create Notification Prototype');

    let transformed_notification_prototype = {
      user: user,
      account: account,
      type: notification_prototype.type,
      category: notification_prototype.category,
      context: notification_prototype.context,
      name: notification_prototype.name
    };

    transformed_notification_prototype = this.setNotificationReadAt(transformed_notification_prototype, user_settings, augmented_normalized_notification_settings);

    return this.notificationController.create({entity: transformed_notification_prototype});

  }

  setNotificationReadAt(notification_prototype, user_settings, augmented_normalized_notification_settings){

    du.debug('Set Notification Read At');

    let six_notification_opt_in = this.getReceiveSettingForChannel('six', user_settings);

    if(six_notification_opt_in == false){

      notification_prototype.read_at = timestamp.getISO8601();

    }else{

      let notification_category_opt_in = this.getNotificationCategoryOptIn(notification_prototype.category, augmented_normalized_notification_settings);
      let notification_type_opt_in = this.getNotificationTypeOptIn(notification_prototype.type, augmented_normalized_notification_settings);

      if(notification_type_opt_in == false || notification_category_opt_in == false){
        notification_prototype.read_at = timestamp.getISO8601();
      }

    }

    return notification_prototype;

  }

  getReceiveSettingForChannel(notification_channel, user_settings){

    du.debug('Get Receive Setting For Channel');

    let channel_settings = arrayutilities.find(user_settings.notifications, (notification_setting) => {
      return (notification_setting.name === notification_channel);
    });

    return (!_.isNull(channel_settings) && _.has(channel_settings, 'receive') && (channel_settings.receive == true));

  }

  getNotificationCategoryOptIn(category, augmented_normalized_notification_settings){

    du.debug('Get Notification Category Opt-In');

    return _.contains(augmented_normalized_notification_settings.notification_categories, category);

  }

  getNotificationTypeOptIn(){

    du.debug('Get Notification Type Opt-In');

    //Technical Debt: This functionality isn't really well understood.
    return true;

  }

  sendNotificationToChannels(){

    du.debug('Send Notification To Channels');

    let common_parameterization = arguments[0];

    let notification_channel_promises = [
      this.sendEmail(common_parameterization),
      this.sendSMS(common_parameterization),
      this.sendSlackMessage(common_parameterization)
    ];

    return Promise.all(notification_channel_promises).then(() => {
      return true;
    });

  }

  getUserLanguagePreference(user_settings){

    du.debug('Get User Language Preferences');

    if(_.has(user_settings, 'language')){
      return user_settings.language;
    }

    return 'English';

  }

  parseFields(content, data){

    du.debug('Parse Fields');

    return parserutilities.parse(content, data);

  }

  getChannelConfiguration(notification_channel, user_settings) {

    du.debug('Get Channel Configuration');

    let channel_settings = arrayutilities.find(user_settings.notifications, (notification_setting) => {
      return (notification_setting.name === notification_channel);
    });

    if(_.has(channel_settings, 'data')){
      return channel_settings.data;
    }

    return null;

  }

  getTranslationObject(language_preference, path, fatal){

    du.debug('Get Translation Object');

    fatal = (_.isUndefined(fatal) || _.isNull(fatal))?true:fatal;

    if(!_.has(this, 'translationHelperController')){
      const TranslationHelperController = global.SixCRM.routes.include('helpers', 'translation/Translation.js');
      this.translationHelperController = new TranslationHelperController();
    }

    let translation_object = this.translationHelperController.getTranslationObject(language_preference, 'notifications.'+path);

    if(_.isNull(translation_object) && language_preference == 'English' && fatal){

      eu.throwError('server', 'Missing '+language_preference+' Notification Translation: '+path);

    }else if(_.isNull(translation_object)){

      du.warning('Missing '+language_preference+' Notification Translation: '+path);

      if(language_preference !== 'English'){
        return this.getTranslationObject('English', path);
      }

    }

    return translation_object;

  }

  buildReadableNotificationObject(channel, notification_prototype, user_settings){

    du.debug('Build Readable Notification Object');

    let language_preference = this.getUserLanguagePreference(user_settings);

    let notification_path = arrayutilities.compress([channel, notification_prototype.category, notification_prototype.name], '.','');

    let notification_translation_prototype = this.getTranslationObject(language_preference, notification_path, false);

    if(this.isValidNotificationTranslationPrototype(notification_translation_prototype)){

      let readable_notification = {
        body: this.parseFields(notification_translation_prototype.body, notification_prototype.context),
        title: this.parseFields(notification_translation_prototype.title, notification_prototype.context)
      };

      return readable_notification;

    }else if(channel !== 'default'){

      return this.buildReadableNotificationObject('default', notification_prototype, user_settings);

    }

    eu.throwError('server', 'Missing Notification Translation Prototype: '+language_preference+':'+notification_path);

  }

  isValidNotificationTranslationPrototype(translation_prototype){

    du.debug('Is Valid Notification Translation Prototype');

    if(!_.isNull(translation_prototype)){
      if(_.has(translation_prototype, 'body') && _.has(translation_prototype, 'title')){
        return true;
      }
    }

    return false;

  }

  sendEmail(){

    du.debug('Send Email');

    return this.sendChannelNotification('email', arguments[0]);

  }

  sendSMS(){

    du.debug('Send SMS');

    return this.sendChannelNotification('sms', arguments[0]);

  }

  sendSlackMessage(){

    du.debug('Send Slack Message');

    return this.sendChannelNotification('slack', arguments[0]);

  }

  sendChannelNotification(channel, {notification, user_settings}){

    du.debug('Send Channel Notification');

    if(this.getReceiveSettingForChannel(channel, user_settings)){

      let channel_data = this.getChannelConfiguration(channel, user_settings);

      if(channel_data){

        let readable_notification = this.buildReadableNotificationObject(channel, notification, user_settings);

        if(!_.has(this.channel_providers, channel)){
          const ChannelProvider = global.SixCRM.routes.include('providers','notification/'+channel+'-notification-provider.js');
          this.channel_providers[channel] = new ChannelProvider();
        }

        return this.channel_providers[channel].sendNotification(readable_notification, channel_data);

      }

    }

    return Promise.resolve(false);

  }

}

module.exports = new NotificationProvider();
