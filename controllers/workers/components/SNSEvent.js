const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const PermissionUtilities = require('@sixcrm/sixcrmcore/util/permission-utilities').default;

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

		try {

			const message = JSON.parse(this.parameters.get('record').Sns.Message);
			this.parameters.set('message', message);

		} catch (error) {

			du.error(error);
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

	cleanUp() {

		du.debug('Clean Up');

		objectutilities.map(this.parameters.store, key => {
			if (key !== 'records') {
				this.parameters.unset(key);
			}
		});

	}

}
