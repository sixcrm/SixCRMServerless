const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;


module.exports = class WorkerController {

	constructor(){

		this.setPermissions();

	}

	setPermissions(){

		//Technical Debt:  This is pretty gross, we should set the user to "system@sixcrm.com"
		du.debug('Set Permissions');

		this.permissionutilities = require('@sixcrm/sixcrmcore/util/permission-utilities').default;
		this.permissionutilities.setPermissions('*',['*/*'],[])

	}

	pushEvent({event_type, context, message_attributes}){

		du.debug('Push Event');

		let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
		return new EventPushHelperController().pushEvent({event_type: event_type, context: context, message_attributes: message_attributes});

	}

}
