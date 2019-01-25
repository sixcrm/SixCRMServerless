const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;

const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
const Parameters = global.SixCRM.routes.include('controllers', 'providers/Parameters.js');
const PermissionUtilities = require('@6crm/sixcrmcore/lib/util/permission-utilities').default;

module.exports = class SNSEventController {

	constructor() {

		this.parameter_definition = {
			execute: {
				required: {
					records: 'Records'
				},
				optional: {}
			}
		};

		this.parameter_validation = {
			'records': global.SixCRM.routes.path('model', 'workers/snsEvents/records.json'),
			'message': global.SixCRM.routes.path('model', 'workers/snsEvents/message.json'),
			'record': global.SixCRM.routes.path('model', 'workers/snsEvents/snsrecord.json')
		};

		this.parameters = new Parameters({
			validation: this.parameter_validation,
			definition: this.parameter_definition
		});

		this.setPermissions();

	}

	setPermissions() {
		this.permissionutilities = PermissionUtilities;
		this.permissionutilities.setPermissions('*', ['*/*'], [])

	}

	augmentParameters() {
		this.parameters.setParameterValidation({
			parameter_validation: this.parameter_validation
		});

		this.parameters.setParameterDefinition({
			parameter_definition: this.parameter_definition
		});

	}

	execute(argumentation) {
		return Promise.resolve()
			.then(() => this.parameters.setParameters({
				argumentation,
				action: 'execute'
			}))
			.then(() => this.handleEvents())

	}

	handleEvents() {
		return Promise.all(this.parameters.get('records').map(this.handleEventRecord.bind(this)));

	}

	handleEventRecord(record) {
		return Promise.resolve()
			.then(() => this.parameters.set('record', record))
			.then(() => this.getMessage())
			.then(() => {

				if (_.has(this, 'event_record_handler') && _.isFunction(this[this.event_record_handler])) {

					return this[this.event_record_handler]();

				}

				throw eu.getError('server', 'Event record handler not set.');

			})
			.then((result) => {
				this.cleanUp();
				return result;
			})
			.catch((ex) => {

				du.error('SNSEvent.handleEventRecord(): error handling SNS event', ex, record);

			});

	}

	getMessage() {
		try {

			const record = this.parameters.get('record');
			const message = JSON.parse(record.Sns.Message);
			message.context = JSON.parse(message.context);
			this.parameters.set('message', message);

		} catch (error) {

			du.error("Error getting SNS message", error);
			throw eu.getError(error);

		}

	}

	isCompliantEventType() {
		if (_.has(this, 'compliant_event_types') && arrayutilities.nonEmpty(this.compliant_event_types)) {

			const event_type = this.parameters.get('message').event_type;

			const matching_event = arrayutilities.find(this.compliant_event_types, compliant_event_type => {

				return stringutilities.isMatch(event_type, new RegExp(`^${compliant_event_type}`));

			});

			if (!_.isString(matching_event)) {

				throw eu.getError('server', 'Not a complaint event type: ' + event_type);

			}

		}

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

	async handleContext(message, fatal = false){
		let return_object = null;

		if(_.has(message, 'context')){

			if(_.has(message.context, 's3_reference')){

				try{

					return_object = new S3Provider().getObject(
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

		}else{

			if(fatal){
				throw eu.getError('server', 'Message missing "context" property.');
			}

			du.warning('Message missing "context" property.');

		}

		return return_object;

	}

	cleanUp() {
		objectutilities.map(this.parameters.store, key => {
			if (key !== 'records') {
				this.parameters.unset(key);
			}
		});

	}

}
