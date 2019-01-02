const _ = require('lodash');
const uuid = require('uuid');

const eu = require('@6crm/sixcrmcore/util/error-utilities').default;

const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');

const SystemUser = {id: 'system@sixcrm.com'};

module.exports = class EventPushHelperController {

	constructor() {}

	pushEvent({event_type = null, context = null, message_attributes = null} = {}) {
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

		let user = global.user;

		if(!_.has(global, 'user')) {
			user = SystemUser;
		}

		return new EventHelperController().pushEvent({
			event_type: event_type,
			context: Object.assign(
				{
					id: uuid.v4()
				},
				context,
				{
					user: user
				}
			),
			message_attributes: message_attributes
		});

	}

}
