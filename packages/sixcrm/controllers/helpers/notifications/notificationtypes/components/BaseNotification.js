
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

const NotificationUtilities = global.SixCRM.routes.include('helpers','notifications/notificationtypes/components/NotificationUtilities.js');

module.exports = class BaseNotification extends NotificationUtilities {

	constructor(){

		super();

		this.category = 'base';
		this.notification_type = 'notification';

	}

	createContext(context){
		let refined_context = {};

		if(_.has(this, 'context_required') && arrayutilities.nonEmpty(this.context_required)){
			arrayutilities.map(this.context_required, context_required_element => {
				let acquired_element = this.contextHelperController.getFromContext(context, context_required_element, false);
				if(!_.isNull(acquired_element)){
					refined_context[context_required_element] = acquired_element;
				}else{
					du.error(context);
					throw eu.getError('server','Unable to identify "'+context_required_element+'" from context.');
				}
			});
		}

		return refined_context;

	}

	transformContext(context){
		let return_object = {
			name: this.getName(),
			user: this.getUserFromContext(context),
			account: this.getAccountFromContext(context),
			type: this.getNotificationType(),
			category: this.getNotificationCategory(),
			context: this.createContext(context)
		};

		du.info('Transformed Context: ', return_object);

		return return_object;

	}

	//Entrypoint
	triggerNotifications(transformed_context){
		if(!_.has(this, 'notificationProvider')){
			const NotificationProvider = global.SixCRM.routes.include('providers', 'notification/Notification.js');
			this.notificationProvider = new NotificationProvider();
		}

		if(_.has(this, 'account_wide') && this.account_wide == true){
			return this.notificationProvider.createNotificationsForAccount({notification_prototype: transformed_context});
		}

		return this.notificationProvider.createNotificationForAccountAndUser({notification_prototype: transformed_context});

	}

}
