const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const StateHelperController = global.SixCRM.routes.include('helpers', 'entities/state/State.js');
const StepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class StepFunctionReporterController extends StepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('execute');

		this.consolidateEvent(event);

		this.validateEvent(event);

		let additional_parameters = this.getAdditionalParameters(event);

		du.info(additional_parameters);
		//await this.report(input, additional_parameters);

		return 'SUCCESS';

	}

	consolidateEvent(event){

		du.debug('Consolidate Event');

		if(_.has(event, 'reporting') && _.isObject(event.reporting)){
			event  = objectutilities.merge(event, event.reporting);
		}

	}

	getAdditionalParameters(event){

		du.debug('Get Additional Parameters');

		du.info(event);
		return {};

	}

	async report(event, additional_parameters = {}){

		du.debug('Report');

		let account = await this.getAccount(event);
		let entity = await this.getEntity(event);
		let name = this.getName(event);
		let execution = await this.getExecution(event);

		let parameters = {
			account: account,
			entity: entity,
			name: name,
			execution: execution
		};

		objectutilities.map(parameters, key => {
			if(_.isNull(parameters[key])){
				delete parameters[key];
			}
		});

		parameters = objectutilities.merge(parameters, additional_parameters);

		return (new StateHelperController()).report(parameters);

	}

	getExecution(event){

		du.debug('Get Execution');

		if(_.has(event, 'executionid')){
			return event.executionid;
		}

		return null;

	}

	getName(event){

		du.debug('Get Name');

		if(_.has(event, 'state')){
			return event.state;
		}

		if(_.has(this, 'state_name')){
			return this.state_name
		}

		return null;

	}

	async getEntity(event){

		du.debug('Get Entity');

		if(_.has(event, 'guid')){
			return event.guid;
		}

		return null;

	}

}
