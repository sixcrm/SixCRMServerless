const _ = require('lodash');
const uuid = require('uuid');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;

const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');

module.exports = class EventPushHelperController {

	constructor() {}

	pushEvent({event_type = null, context = null, message_attributes = null} = {}) {

		du.debug('EventPushHelperController.pushEvent()');

		if (event_type === undefined || event_type === null) {
			if ((context !== undefined) && (context !== null) && _.has(context, 'event_type') && _.isString(context.event_type)) {
				event_type = context.event_type;
			} else {
				throw eu.getError('server', 'Unable to identify event_type.');
			}
		}

		if ((context === undefined) || (context === null)) {
			context = {};
		}

		if(!_.has(global, 'user')){
			throw eu.getError('server', 'Global missing "user" property.');
		}

		return new EventHelperController().pushEvent({
			event_type: event_type,
			context: Object.assign(
				{
					id: uuid.v4()
				},
				context,
				{
					user: global.user
				}
			),
			message_attributes: message_attributes
		});

	}

}
