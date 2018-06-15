const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

module.exports = class HelperController {

	constructor(){}

	pushEvent({event_type, context, message_attributes}){

		du.debug('Push Event');

		if(_.isUndefined(event_type) || _.isNull(event_type)){
			if(_.has(this, 'event_type')){
				event_type = this.event_type;
			}else if (!_.isUndefined(context) && !_.isNull(context) && _.has(context, 'event_type') && _.isString(context.event_type)){
				event_type = context.event_type;
			}else{
				throw eu.getError('server', 'Unable to identify event_type.');
			}
		}

		if(_.isUndefined(context) || _.isNull(context)){
			if(objectutilities.hasRecursive(this, 'parameters.store')){
				context = this.parameters.store;
			}else{
				throw eu.getError('server', 'Unset context.');
			}
		}

		if(_.isUndefined(message_attributes) || _.isNull(message_attributes)){
			message_attributes = {
				'event_type': {
					DataType:'String',
					StringValue: event_type
				}
			};
		}

		if(!_.has(this, 'eventHelperController')){
			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			this.eventHelperController = new EventHelperController();
		}

		return this.eventHelperController.pushEvent({event_type: event_type, context: context, message_attributes: message_attributes});

	}

}
