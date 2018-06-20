const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;

const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
const NotificationsHelperController = global.SixCRM.routes.include('helpers', 'notifications/Notification.js');

module.exports = class NotificationEventsController{

	constructor(){}

	async execute(records) {

		du.debug('Execute');

		await this.handleEventRecords(records);

	}

	handleEventRecords(input) {

		du.debug('Handle Events');

		if(!_.has(input, 'Records')){
			return null;
		}

		let records_promises = input.Records.map((record) => {
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

		du.debug('Handle Event Record');

		//this.isCompliantEventType();

		global.SixCRM.validate(record, global.SixCRM.routes.path('model','workers/snsEvents/snsrecord.json'), true);

		let message = this.getMessage(record)

		return this.triggerNotification(message);

	}

	//Move to SNS Controller
	getMessage(record) {

		du.debug('Get Message');

		const message = JSON.parse(record.Sns.Message);

		return message;

	}

	async triggerNotification(message){

		du.debug('Trigger Notifications');

		let context = await this.getContext(message);
		let event_type = this.getEventType(message);

		return new NotificationsHelperController().executeNotifications({
			event_type: event_type,
			context: context
		});

	}

	async getContext(message, fatal = false){

		du.debug('Handle Context');

		let return_object = null;

		if(_.has(message, 'context')){

			if(_.has(message.context, 's3_reference')){

				try{

					return_object = await new S3Provider().getObject(
						'sixcrm-'+global.SixCRM.configuration.stage+'-sns-context-objects',
						message.context.s3_reference
					);

					try{
						return_object = JSON.parse(return_object);
					}catch(error){
						du.info('Context not a stringified object.');
					}

				}catch(error){

					if(fatal){
						throw error;
					}

					du.warning(error.message);

				}

			}else{
				return_object = message.context;
			}

		}else{

			if(fatal){
				throw eu.getError('server', 'Message missing "context" property.');
			}

			du.warning('Message missing "context" property.');

		}

		return return_object;

	}

	getEventType(message, fatal = true){

		du.debug('Get Event Type');

		if(!_.has(message, 'event_type')){

			if(fatal){
				throw eu.getError('server', 'Message missing event type');
			}

			du.warning('Message missing event type');

		}

		return message.event_type;

	}

}
