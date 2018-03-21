'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

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

		this.permissionutilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');
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

		return true;

	}

	execute() {

		du.debug('Execute');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({
				argumentation: arguments[0],
				action: 'execute'
			}))
			.then(() => this.handleEvents())

	}

	handleEvents() {

		du.debug('Handle Events');

		let records = this.parameters.get('records');

		let event_promises = arrayutilities.map(records, record => {
			return () => this.handleEventRecord(record);
		});

		//Technical Debt:  This would be great if it did all this stuff asyncronously down the road
		return arrayutilities.reduce(
			event_promises,
			(current, event_promise) => {
				return event_promise().then(() => {
					return true;
				})
			},
			Promise.resolve(true)
		).then(() => {
			return true;
		});

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
				eu.throwError('server', 'Event record handler not set.');
			})
			.then(() => this.cleanUp());

	}

	getMessage() {

		du.debug('Get Message');

		let message = this.parameters.get('record').Sns.Message;

		try {
			message = JSON.parse(message);
		} catch (error) {
			du.error(error);
			eu.throwError(error);
		}

		this.parameters.set('message', message);

		return true;

	}

	isComplaintEventType() {

		du.debug('Is Complaint Tracking Event Type');

		if (_.has(this, 'compliant_event_types') && arrayutilities.nonEmpty(this.compliant_event_types)) {

			let event_type = this.parameters.get('message').event_type;

			let matching_event = arrayutilities.find(this.compliant_event_types, compliant_event_type => {
				let re = new RegExp(compliant_event_type);

				return stringutilities.isMatch(event_type, re);
			});

			if (_.isString(matching_event)) {
				return true;
			}

			eu.throwError('server', 'Not a complaint event type: ' + event_type);

		}

		return true;

	}

	cleanUp() {

		du.debug('Clean Up');

		objectutilities.map(this.parameters.store, key => {
			if (key !== 'records') {
				this.parameters.unset(key);
			}
		});

		return true;

	}

}