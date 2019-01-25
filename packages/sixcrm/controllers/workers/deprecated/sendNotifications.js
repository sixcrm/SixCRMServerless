var _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/Notification.js');
const notificationProvider =  new NotificationProvider();
const PermissionUtilities = require('@6crm/sixcrmcore/lib/util/permission-utilities').default;


var workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

//Tecnhincal Debt:  Is this in use??
module.exports = class sendNotificationsController extends workerController {

	constructor(){
		super();
		this.messages = {
			success:'SUCCESS',
			successnoaction:'SUCCESSNOACTION',
			failure:'FAIL'
		}
	}

	execute(event){
		return this.getMessage(event)
			.then((message) => this.validateMessage(message))
			.then((message) => this.sendNotification(message))
			.then((results) => this.respond(results))
			.catch(() => {
				return this.messages.failure;
			});

	}

	getMessage(event){
		return this.parseInputEvent(event, false);

	}

	validateMessage(message){
		global.SixCRM.validate(message, global.SixCRM.routes.path('model', 'workers/sendnotification/notificationmessage.json'));

		if(message.scope.user == true && !_.has(message, 'user')){
			throw eu.getError('server', 'The user email must be inclided if the scope.user setting is true.');
		}

		return message;

	}

	sendNotification(message){
		let cloned_message = objectutilities.clone(message);

		delete cloned_message.scope;

		PermissionUtilities.disableACLs();

		let notification_promise;

		if(message.scope.user == true){
			notification_promise = notificationProvider.createNotificationForAccountAndUser(cloned_message);
		}else{
			notification_promise = notificationProvider.createNotificationsForAccount(cloned_message);
		}

		return Promise.resolve(notification_promise).then(result => {
			PermissionUtilities.enableACLs();
			return result;
		});

	}

	respond(){
		return this.messages.success;

	}

}
