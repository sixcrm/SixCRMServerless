const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const permissionutilities = require('@6crm/sixcrmcore/lib/util/permission-utilities').default;

const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');

const NotificationsHelperController = global.SixCRM.routes.include('helpers', 'notifications/Notification.js');

module.exports = class NotificationEventsController {

	constructor(){

		this.setPermissions();

	}

	async execute(input) {
		let records = this.getRecords(input);

		await this.handleEventRecords(records);

	}

	setPermissions(){
		permissionutilities.setPermissions('*',['*/*'],[])

	}

	getRecords(input){
		du.info(input);

		if(!_.has(input, 'Records')){
			throw eu.getError('server', 'Unexpected Input, missing "Records" property.');
		}

		if(!_.isArray(input.Records)){
			throw eu.getError('server', 'Unexpected Input, "Records" property is not a array.');
		}

		return input.Records;

	}

	handleEventRecords(records) {
		let records_promises = records.map((record) => {
			try{
				return this.handleEventRecord(record);
			}catch(error){
				du.warning(error);
			}
			return null;
		});

		return Promise.all(records_promises);

	}

	handleEventRecord(record) {
		//this.isCompliantEventType();

		global.SixCRM.validate(record, global.SixCRM.routes.path('model','workers/snsEvents/snsrecord.json'), true);

		let message = this.getMessage(record)

		return this.triggerNotification(message);

	}

	//Move to SNS Controller
	getMessage(record) {
		let message = null;

		if(!_.has(record, 'Sns')){
			throw eu.getError('server', 'record missing "Sns" property.');
		}

		if(!_.has(record.Sns, 'Message')){
			throw eu.getError('server', 'record.Sns missing "Message" property.');
		}

		try{

			message = JSON.parse(record.Sns.Message);

		}catch(error){

			du.error(error);

		}

		return message;

	}

	async triggerNotification(message){
		let context = await this.getContext(message);
		let event_type = this.getEventType(message);

		return new NotificationsHelperController().executeNotifications({
			event_type: event_type,
			context: context
		});

	}

	async getContext(message, fatal = false){
		let return_object = null;

		if(!_.isObject(message) || !_.has(message, 'context')){

			if(fatal){
				throw eu.getError('server', 'Message missing "context" property.');
			}
			du.warning('Message missing "context" property.');

			return return_object;

		}

		if(!_.isObject(message.context)){

			try{
				message.context = JSON.parse(message.context);
			}catch(error){
				du.info('message.context not a stringified object.');
			}

		}

		if(_.isObject(message.context) && _.has(message.context, 's3_reference')){

			try{

				return_object = await new S3Provider().getObject(
					'sixcrm-'+global.SixCRM.configuration.stage+'-sns-context-objects',
					message.context.s3_reference
				);

			}catch(error){

				if(fatal){
					throw error;
				}

				du.warning(error.message);

			}

		}else{

			return_object = message.context;

		}

		if(!_.isObject(return_object)){

			try{
				return_object = JSON.parse(return_object);
			}catch(error){
				du.info('Context not a stringified object.');
			}

		}

		return return_object;

	}

	getEventType(message, fatal = true){
		if(!_.has(message, 'event_type')){

			if(fatal){
				throw eu.getError('server', 'Message missing event type');
			}

			du.warning('Message missing event type');

		}

		return message.event_type;

	}

}
