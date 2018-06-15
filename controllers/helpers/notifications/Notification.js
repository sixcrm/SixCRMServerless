

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const fileutilities = require('@sixcrm/sixcrmcore/util/file-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;

module.exports = class NotificationHelperClass {

	constructor(){

		//Technical Debt:  Need to add validation schemas here...
		this.parameter_validation = {};

		this.parameter_definition = {
			executeNotifications:{
				required:{
					eventtype: 'event_type',
					context: 'context'
				},
				optional:{}
			}
		};

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	executeNotifications(){

		du.debug('Execute Notifications');

		this.parameters.store = {};

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'executeNotifications'}))
			.then(() => this.isNotificationEventType())
			.then(() => this.instantiateNotificationClass())
			.then(() => this.transformContext())
			.then(() => this.executeNotificationActions())
			.catch((error) => {
				if(error.statusCode == 404){
					return Promise.resolve(true);
				}
				du.error(error);
				return Promise.reject(error);
			});

	}

	isNotificationEventType(){

		du.debug('Is Notification Event Type');

		let event_type = this.parameters.get('eventtype');

		//Note:  These are a subset of event types which are notification events
		let valid_event_type = global.SixCRM.validate(event_type, global.SixCRM.routes.path('model', 'helpers/notifications/notificationevent.json'), false);

		if(valid_event_type == true){
			return true;
		}

		throw eu.getError('not_found','Not a notification event type: '+event_type);

	}

	instantiateNotificationClass(){

		du.debug('Instantiate Notification Class');

		let event_type = this.parameters.get('eventtype');

		let NotificationType = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/default.js');
		let notification_class = new NotificationType();
		this.parameters.set('notificationclass', notification_class);

		return fileutilities.getDirectoryFiles(global.SixCRM.routes.path('helpers','notifications/notificationtypes/'))
			.then(directory_files => {

				let matching_notification_file = arrayutilities.find(directory_files, directory_file => {
					return stringutilities.isMatch(directory_file.replace('.json',''), new RegExp(event_type, "g"));
				});

				if(matching_notification_file){

					du.warning('Matching notification file for event_type ('+event_type+') '+matching_notification_file);

					NotificationType = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/'+matching_notification_file);
					let notification_class = new NotificationType();
					this.parameters.set('notificationclass', notification_class);

				}else{

					du.warning('No matching notification file for event type: '+event_type);

				}

				return true;

			});

	}

	transformContext(){

		du.debug('Transform Context');

		let context = this.parameters.get('context');
		let notification_class = this.parameters.get('notificationclass');

		let transformed_context = notification_class.transformContext(context);

		this.parameters.set('transformedcontext', transformed_context);

		return true;

	}

	executeNotificationActions(){

		du.debug('Execute Notification Actions');

		let transformed_context = this.parameters.get('transformedcontext');
		let notification_class = this.parameters.get('notificationclass');

		return notification_class.triggerNotifications(transformed_context);

	}

}
