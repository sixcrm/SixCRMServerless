
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class workerController {

	constructor(){

		this.setPermissions();

	}

	validateEvent(event){

		du.debug('Validate Event');

		du.info('Input event: '+JSON.stringify(event));

		if(!_.has(event, 'guid')){
			throw eu.getError('bad_request', 'Expected property "guid" in the event object');
		}

		if(!stringutilities.isUUID(event.guid)){
			throw eu.getError('bad_request', 'Expected property "guid" to be a UUIDV4');
		}

		return event;

	}

	setPermissions(){

		du.debug('Set Permissions');

		//Technical Debt:  Let's change this to be the system@sixcrm.com user

		this.permissionutilities = global.SixCRM.routes.include('lib','permission-utilities.js');
		this.permissionutilities.setPermissions('*',['*/*'],[])

	}

	async getShippingReceipt(id, fatal = true){

		du.debug('Get Shipping Receipt');

		if(!_.has(this, 'shippingReceiptController')){
			const ShippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
			this.shippingReceiptController = new ShippingReceiptController();
		}

		let shipping_receipt = await this.shippingReceiptController.get({id: id});

		if(_.isNull(shipping_receipt)){
			if(fatal){
				throw eu.getError('server', 'Unable to acquire a shipping receipt that matches '+id);
			}

			du.warning('Unable to acquire a shipping receipt that matches '+id);

		}

		return shipping_receipt;

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
			const EventHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
			this.eventHelperController = new EventHelperController();
		}

		return this.eventHelperController.pushEvent({event_type: event_type, context: context, message_attributes: message_attributes});

	}

}
