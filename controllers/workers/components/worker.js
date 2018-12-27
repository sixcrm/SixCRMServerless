module.exports = class WorkerController {

	constructor(){

		this.setPermissions();

	}

	setPermissions(){
		//Technical Debt:  This is pretty gross, we should set the user to "system@sixcrm.com"

		this.permissionutilities = require('@6crm/sixcrmcore/util/permission-utilities').default;
		this.permissionutilities.setPermissions('*',['*/*'],[])

	}

	pushEvent({event_type, context, message_attributes}){
		let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
		return new EventPushHelperController().pushEvent({event_type: event_type, context: context, message_attributes: message_attributes});

	}

}
