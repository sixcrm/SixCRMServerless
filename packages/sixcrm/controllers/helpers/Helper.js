module.exports = class HelperController {

	constructor(){}

	pushEvent({event_type, context, message_attributes}){
		let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
		return new EventPushHelperController().pushEvent({event_type: event_type, context: context, message_attributes: message_attributes});

	}

}
