

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const SNSEventController = global.SixCRM.routes.include('controllers', 'workers/components/SNSEvent.js');

module.exports = class NotificationEventsController extends SNSEventController {

	constructor(){

		super();

		this.event_record_handler = 'triggerNotification';

	}

	triggerNotification(){

		du.debug('Trigger Notifications');

		return Promise.resolve()
		//Note:  Because compliant_event_types is not defined in this class, all events pass the checks here.
			.then(() => this.isCompliantEventType())
			.then(() => this.executeNotification())
			.catch(error => {
				du.error(error);
				return true;
			});

	}

	executeNotification(){

		du.debug('Execute Notification');

		let event_type = this.parameters.get('message').event_type;
		let context = this.parameters.get('message').context;

		const NotificationsHelperController = global.SixCRM.routes.include('helpers', 'notifications/Notification.js');
		let notificationsHelperController = new NotificationsHelperController();

		return notificationsHelperController.executeNotifications({event_type: event_type, context: context});

	}

}
