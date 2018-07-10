const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;

const S3Provider = global.SixCRM.routes.include('controllers', 'providers/s3-provider.js');
const Parameters = global.SixCRM.routes.include('controllers', 'providers/Parameters.js');
const PermissionUtilities = require('@6crm/sixcrmcore/util/permission-utilities').default;

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

		du.debug('Set Permissions');

		this.permissionutilities = PermissionUtilities;
		this.permissionutilities.setPermissions('*', ['*/*'], [])

	}

	augmentParameters() {

		du.debug('Augment Parameters');

		this.parameters.setParameterValidation({
			parameter_validation: this.parameter_validation
		});

		this.parameters.setParameterDefinition({
			parameter_definition: this.parameter_definition
		});

	}

	execute(argumentation) {

		du.debug('Execute');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({
				argumentation,
				action: 'execute'
			}))
			.then(() => this.handleEvents())

	}

	handleEvents() {

		du.debug('Handle Events');

		return Promise.all(this.parameters.get('records').map(this.handleEventRecord.bind(this)));

	}

	handleEventRecord(record) {

		du.debug('Handle Event Record');

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

		du.debug('Get Message');

		const record = this.parameters.get('record');
		try {

			const message = JSON.parse(record.Sns.Message);
			this.parameters.set('message', message);

		} catch (error) {

			du.error("Error getting SNS message", error, record);
			throw eu.getError(error);

		}

	}

	isCompliantEventType() {

		du.debug('Is Complaint Tracking Event Type');

		if (_.has(this, 'compliant_event_types') && arrayutilities.nonEmpty(this.compliant_event_types)) {

			const event_type = this.parameters.get('message').event_type;

			const matching_event = arrayutilities.find(this.compliant_event_types, compliant_event_type => {

				return stringutilities.isMatch(event_type, new RegExp(`^${compliant_event_type}`));

			});

			if (!_.isString(matching_event)) {

				du.debug('server', 'Not a complaint event type: ' + event_type);

			}

		}

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

	async handleContext(message, fatal = false){

		du.debug('Handle Context');

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

		du.debug('Clean Up');

		objectutilities.map(this.parameters.store, key => {
			if (key !== 'records') {
				this.parameters.unset(key);
			}
		});

	}

}
