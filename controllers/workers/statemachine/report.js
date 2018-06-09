const _ = require('lodash')

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

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
				throw  eu.getError('server', 'Event missing field: '+required_field);
			}
		});

		return event;

	}

}
