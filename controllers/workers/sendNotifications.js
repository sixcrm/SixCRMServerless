
var _ = require('lodash');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/Notification.js');
const notificationProvider =  new NotificationProvider();
const PermissionUtilities = global.SixCRM.routes.include('lib','permission-utilities.js');


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

		du.debug('Executing Send Notifications');

		return this.getMessage(event)
			.then((message) => this.validateMessage(message))
			.then((message) => this.sendNotification(message))
			.then((results) => this.respond(results))
			.catch(() => {
				return this.messages.failure;
			});

	}

	getMessage(event){

		du.debug('Get Messages');

		return this.parseInputEvent(event, false);

	}

	validateMessage(message){

		du.debug('Filter Invalid Messages');

		mvu.validateModel(message, global.SixCRM.routes.path('model', 'workers/sendnotification/notificationmessage.json'));

		if(message.scope.user == true && !_.has(message, 'user')){
			throw eu.getError('server', 'The user email must be inclided if the scope.user setting is true.');
		}

		return message;

	}

	sendNotification(message){

		du.debug('Send Notification');

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

		du.debug('Respond');

		return this.messages.success;

	}

}
