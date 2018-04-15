
const forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

module.exports = class SendNotificationsToArchivedForwardMessageController extends forwardMessageController {

	constructor(){

		super();

		this.parameters.set('params', {
			name: 'sendnotificationstoarchive',
			origin_queue: 'send_notification',
			workerfunction: 'sendNotifications.js'
		})

	}

};
