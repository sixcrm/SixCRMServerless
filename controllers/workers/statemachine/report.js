const _ = require('lodash')

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const stepFunctionReporterController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionReporter.js');

module.exports = class ReporterController extends stepFunctionReporterController {

	constructor() {

		super();

	}

	validateEvent(event){

		du.debug('Validate Input');

		let required = ['executionid', 'guid', 'state'];

		arrayutilities.map(required, (required_field) => {
			if(!_.has(event, required_field)){
				du.error(event);
				throw  eu.getError('server', 'Event missing field: '+required_field);
			}
		});

		return event;

	}

}
