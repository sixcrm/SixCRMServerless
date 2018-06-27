const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class HelperController {

	constructor(){}

	pushEvent({event_type, context, message_attributes}){

		du.debug('Push Event');

		let EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
		return new EventPushHelperController().pushEvent({event_type: event_type, context: context, message_attributes: message_attributes});

	}

}
