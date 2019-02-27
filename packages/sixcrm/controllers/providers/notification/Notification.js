
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;
const parserutilities = require('@6crm/sixcrmcore/lib/util/parser-utilities').default;
const NotificationController = global.SixCRM.routes.include('controllers', 'entities/Notification.js');
const NotificationSettingController = global.SixCRM.routes.include('controllers', 'entities/NotificationSetting.js');
const UserSettingController = global.SixCRM.routes.include('controllers', 'entities/UserSetting.js');
const UserACLController = global.SixCRM.routes.include('controllers', 'entities/UserACL.js');

module.exports = class NotificationProvider {

	constructor(){

		this.immutable_categories = [];

		//Technical Debt:  These override the
		this.immutable_types = ['alert', 'persistent'];
		this.channel_providers = {};

		this.userACLController = new UserACLController();
		this.notificationController = new NotificationController();
		this.notificationSettingController = new NotificationSettingController();
		this.userSettingController = new UserSettingController();

	}

	async createNotificationsForAccount({notification_prototype}) {
		let receipt_users = await this.setReceiptUsers(notification_prototype);

		return this.sendNotificationToUsers(receipt_users, notification_prototype);

	}

	async createNotificationForAccountAndUser({notification_prototype}) {
		this.validateNotificationPrototype(notification_prototype, true);

		let receipt_users = await this.setReceiptUsers(notification_prototype, false);

		return this.sendNotificationToUsers(receipt_users, notification_prototype);

	}

	validateNotificationPrototype(notification_prototype, user_required = false) {
		global.SixCRM.validate(notification_prototype, global.SixCRM.routes.path('model', 'providers/notifications/notificationprototype.json'));

		if (user_required && !_.has(notification_prototype, 'user')) {
			throw eu.getError('server', 'User is mandatory in notification prototypes when using the createNotificationsForAccountAndUser method.');
		}

		return true;

	}

	setReceiptUsers(notification_prototype, from_account = true){
		if(from_account){
			return this.setReceiptUsersFromAccount(notification_prototype);
		}

		return this.setReceiptUsersFromNotificationPrototype(notification_prototype);

	}

	setReceiptUsersFromNotificationPrototype(notification_prototype){
		if(!_.has(notification_prototype, 'user')){
			throw eu.getError('server', 'Unable to identify receipt user in notification prototype');
		}

		return [notification_prototype.user];

	}

	async setReceiptUsersFromAccount(notification_prototype){
		if(!_.has(notification_prototype, 'account')){
			throw eu.getError('server', 'Notification Prototype is missing the "account" property.');
		}

		let results = await this.userACLController.getACLByAccount({account: notification_prototype.account});

		if(!arrayutilities.nonEmpty(results)){
			throw eu.getError('server', 'Empty useracls element in account user_acl response');
		}

		let receipt_users = [];

		arrayutilities.map(results, (user_acl_element) => {
			if(!_.has(user_acl_element, 'pending')){
				receipt_users.push(user_acl_element.user);
			}
		});

		return receipt_users;

	}

	sendNotificationToUsers(receipt_users, notification_prototype){
		return arrayutilities.reduce(receipt_users, (current, receipt_user) => {
			return this.saveAndSendNotification({notification_prototype: notification_prototype, account: notification_prototype.account, user: receipt_user})
				.then(() => {
					return true;
				});
		}, true);

	}

	saveAndSendNotification({notification_prototype, account, user}) {
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
		let normalized_notification_settings = default_notification_settings;
		let parsed_notification_settings = null;

		if(!_.isUndefined(notification_settings) && !_.isNull(notification_settings) && _.has(notification_settings, 'settings')){

			if(_.isString(notification_settings.settings)){

				//Technical Debt:  This is deprecated....
				try{
					parsed_notification_settings = JSON.parse(notification_settings.settings)
				}catch(error){
					throw eu.getError(error);
				}

			}else if(_.isObject(notification_settings.settings)){

				parsed_notification_settings = notification_settings.settings;

			}else{

				throw eu.getError('server', 'Unrecognized notification_settions.settings property.');

			}

		}

		if(!_.isNull(parsed_notification_settings)){
			normalized_notification_settings = normalized_notification_settings = objectutilities.recursiveMerge(parsed_notification_settings, normalized_notification_settings);
		}

		return {normalized_notification_settings: normalized_notification_settings, user_settings: user_settings};

	}

	buildNotificationCategoriesAndTypes(notification_settings){
		let notification_categories = this.immutable_categories;

		//Technical Debt:  What's the purpose of this.  Can a user turn off notification types?
		let notification_types = this.immutable_types;

		//Note:  This states that if the default setting for the group (category) has any channel, then it's on.  Otherwise, it's off.
		if(_.has(notification_settings, 'notification_groups') && _.isArray(notification_settings.notification_groups)){
			arrayutilities.map(notification_settings.notification_groups, (notification_group) => {
				if(_.has(notification_group, 'key') && _.has(notification_group, 'default') && arrayutilities.nonEmpty(notification_group.default)){
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
		let six_notification_opt_in = this.getReceiveSettingForChannel({
			notification_channel: 'six',
			user_settings: user_settings
		});

		if(six_notification_opt_in == false && !this.isImmutable(notification_prototype)){

			notification_prototype.read_at = timestamp.getISO8601();

		}else{

			let notification_active = this.getNotificationActive(notification_prototype, augmented_normalized_notification_settings);
			let notification_category_opt_in = this.getNotificationCategoryOptIn(notification_prototype.category, augmented_normalized_notification_settings);
			let notification_type_opt_in = this.getNotificationTypeOptIn(notification_prototype.type, augmented_normalized_notification_settings);

			if((notification_active == false || notification_type_opt_in == false || notification_category_opt_in == false) && !this.isImmutable(notification_prototype)){

				notification_prototype.read_at = timestamp.getISO8601();

			}

		}

		return notification_prototype;

	}

	getNotificationActive(notification_prototype, augmented_normalized_notification_settings){
		if(objectutilities.hasRecursive(augmented_normalized_notification_settings, 'notification_settings.notification_groups') && _.isArray(augmented_normalized_notification_settings.notification_settings.notification_groups)){

			let notification_group = arrayutilities.find(augmented_normalized_notification_settings.notification_settings.notification_groups, notification_group => {
				return (notification_group.key == notification_prototype.category)
			});

			if(!_.isNull(notification_group) && !_.isUndefined(notification_group)){

				if(_.has(notification_group, 'notifications') && arrayutilities.nonEmpty(notification_group.notifications)){

					let notification = arrayutilities.find(notification_group.notifications, notification => {
						return notification.key == notification_prototype.name;
					});

					if(!_.isNull(notification) && _.has(notification, 'active')){
						return (notification.active == true);
					}

				}

			}

		}

		return true;

	}

	getReceiveSettingForChannel({notification_channel, user_settings}){
		if(!_.has(user_settings, 'notifications') || !arrayutilities.nonEmpty(user_settings.notifications)){
			return false;
		}

		let channel_settings = arrayutilities.find(user_settings.notifications, (notification_setting) => {
			return (notification_setting.name === notification_channel);
		});

		return (!_.isNull(channel_settings) && _.has(channel_settings, 'receive') && (channel_settings.receive == true));

	}

	getNotificationCategoryOptIn(category, augmented_normalized_notification_settings){
		return _.includes(augmented_normalized_notification_settings.notification_categories, category);

	}

	isImmutable(notification_prototype){
		if(_.has(notification_prototype, 'type') && _.includes(this.immutable_types, notification_prototype.type)){
			return true;
		}

		return false;

	}

	getNotificationTypeOptIn(){
		//Technical Debt: This functionality isn't really well understood.
		return true;

	}

	sendNotificationToChannels(){
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
		if(_.has(user_settings, 'language')){
			return user_settings.language;
		}

		return 'English';

	}

	parseFields(content, data){
		return parserutilities.parse(content, data);

	}

	getChannelConfiguration(notification_channel, user_settings) {
		let channel_settings = arrayutilities.find(user_settings.notifications, (notification_setting) => {
			return (notification_setting.name === notification_channel);
		});

		if(_.has(channel_settings, 'data')){
			return channel_settings.data;
		}

		return null;

	}

	getTranslationObject(language_preference, path, fatal){
		fatal = (_.isUndefined(fatal) || _.isNull(fatal))?true:fatal;

		if(!_.has(this, 'translationHelperController')){
			const TranslationHelperController = global.SixCRM.routes.include('helpers', 'translation/Translation.js');
			this.translationHelperController = new TranslationHelperController();
		}

		let translation_object = this.translationHelperController.getTranslationObject(language_preference, 'notifications.'+path);

		if(_.isNull(translation_object) && language_preference == 'English' && fatal){

			throw eu.getError('server', 'Missing '+language_preference+' Notification Translation: '+path);

		}else if(_.isNull(translation_object)){

			du.warning('Missing '+language_preference+' Notification Translation: '+path);

			if(language_preference !== 'English'){
				return this.getTranslationObject('English', path);
			}

		}

		return translation_object;

	}

	buildReadableNotificationObject(channel, notification_prototype, user_settings){
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

		throw eu.getError('server', 'Missing Notification Translation Prototype: '+language_preference+':'+notification_path);

	}

	isValidNotificationTranslationPrototype(translation_prototype){
		if(!_.isNull(translation_prototype)){
			if(_.has(translation_prototype, 'body') && _.has(translation_prototype, 'title')){
				return true;
			}
		}

		return false;

	}

	sendEmail(){
		return this.sendChannelNotification('email', arguments[0]);

	}

	sendSMS(){
		return this.sendChannelNotification('sms', arguments[0]);

	}

	sendSlackMessage(){
		return this.sendChannelNotification('slack', arguments[0]);

	}

	sendChannelNotification(channel, {notification, user_settings, augmented_normalized_notification_settings}){
		if(this.getReceiveSettingForChannel({notification_channel: channel, user_settings: user_settings})){

			if(this.receiveChannelOnNotification({channel: channel, notification: notification, augmented_normalized_notification_settings: augmented_normalized_notification_settings})){


				let channel_data = this.getChannelConfiguration(channel, user_settings);

				if(channel_data){

					let readable_notification = this.buildReadableNotificationObject(channel, notification, user_settings);

					if(!_.has(this.channel_providers, channel)){
						const ChannelProvider = global.SixCRM.routes.include('providers','notification/channels/'+channel+'.js');
						this.channel_providers[channel] = new ChannelProvider();
					}

					return this.channel_providers[channel].sendNotification(readable_notification, channel_data);

				}

			}

		}

		return Promise.resolve(false);

	}

	receiveChannelOnNotification({channel, notification, augmented_normalized_notification_settings}){
		const notification_groups = (
			augmented_normalized_notification_settings.settings ||
			augmented_normalized_notification_settings.notification_settings).notification_groups;

		let found_category = arrayutilities.find(notification_groups, notification_group => {
			return (notification_group.key == notification.category);
		});

		if(found_category){
			let found_notification = arrayutilities.find(found_category.notifications, category_notification => {
				return (category_notification.key == notification.name);
			});
			if(found_notification){
				if(_.has(found_notification, 'channels') && _.isArray(found_notification.channels)){
					if(_.includes(found_notification.channels, 'all') || _.includes(found_notification.channels, channel)){
						return true;
					}
					return false;
				}
			}

			if(_.has(found_category, 'default') && _.isArray(found_category.default)){
				if(_.includes(found_category.default, 'all') || _.includes(found_category.default, channel)){
					return true;
				}
			}
		}

		return false;

	}

}
