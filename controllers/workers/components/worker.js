
const _ = require('lodash');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
//const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');

module.exports = class WorkerController {

	constructor(){

		this.setPermissions();

	}

	setPermissions(){

		//Technical Debt:  This is pretty gross, we should set the user to "system@sixcrm.com"
		du.debug('Set Permissions');

		this.permissionutilities = global.SixCRM.routes.include('lib','permission-utilities.js');
		this.permissionutilities.setPermissions('*',['*/*'],[])

	}

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
			this.eventHelperController = new EventHelperController();
		}

		return this.eventHelperController.pushEvent({event_type: event_type, context: context, message_attributes: message_attributes});

	}

}
