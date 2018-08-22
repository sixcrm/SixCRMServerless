const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const fileutilities = require('@6crm/sixcrmcore/util/file-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;

module.exports = class NotificationHelperClass {

	constructor(){}

	async executeNotifications({event_type, context}){

		du.debug('Execute Notifications', event_type);

		this.validateNotification(event_type, context);

		if(!this.isNotificationEventType(event_type)){
			return true;
		}

		let notification_class = await this.instantiateNotificationClass(event_type)
		let transformed_context = this.transformContext(notification_class, context);

		try{
			await this.executeNotificationActions(notification_class, transformed_context);
		}catch(error){
			du.error(error);
			return false;
		}

		return true;

	}

	validateNotification(event_type, context){

		du.debug('Validate Notification');

		if(_.isUndefined(event_type) || _.isNull(event_type)){
			throw eu.getError('server','Expected "event_type" property to be set.');
		}

		if(_.isUndefined(context) || _.isNull(context)){
			throw eu.getError('server','Expected "context" property to be set.');
		}

	}

	isNotificationEventType(event_type){

		du.debug('Is Notification Event Type');

		//Note:  These are a subset of event types which are notification events
		let valid_event_type = global.SixCRM.validate(event_type, global.SixCRM.routes.path('model', 'helpers/notifications/notificationevent.json'), false);

		if(valid_event_type == true){
			return true;
		}

		return false;

	}

	async instantiateNotificationClass(event_type){

		du.debug('Instantiate Notification Class', event_type);

		let directory_files = await fileutilities.getDirectoryFiles(global.SixCRM.routes.path('helpers','notifications/notificationtypes/'));

		let matching_notification_file = arrayutilities.find(directory_files, directory_file => {
			return stringutilities.isMatch(directory_file.replace('.json',''), new RegExp(event_type, "g"));
		});

		if(matching_notification_file){

			du.warning('Matching notification file for event_type ('+event_type+') '+matching_notification_file);

			const NotificationType = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/'+matching_notification_file);
			return new NotificationType();

		}

		const NotificationType = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/default.js');
		return new NotificationType();

	}

	transformContext(notification_class, context){

		du.debug('Transform Context');

		return notification_class.transformContext(context);

	}

	executeNotificationActions(notification_class, transformed_context){

		du.debug('Execute Notification Actions');

		return notification_class.triggerNotifications(transformed_context);

	}

}
