const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

const StepFunctionTriggerController = global.SixCRM.routes.include('workers','statemachine/components/stepFunctionTrigger.js');
const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

module.exports = class SelectRebillsController extends workerController {

	constructor(){

		super();

	}

	async execute(){
		let results = null;

		let rebills = await this.getAvailableRebillsOverPeriod();

		if(_.isArray(rebills) && arrayutilities.nonEmpty(rebills)){

			results = await this.pushRebillsIntoStateMachine(rebills);

		}else{

			du.info('No available rebills');

			return this.respond(null);

		}

		if(!_.isArray(results) && !arrayutilities.nonEmpty(results)){

			du.warning('Unexpected results: '+JSON.stringify(results));
			return this.respond(false);

		}

		let response = this.transformResponse(results);

		return this.respond(response);

	}

	transformResponse(results, fatal = true){
		if(!_.isArray(results)){
			if(fatal == true){
				throw eu.getError('server', 'Non-array results argument');
			}
			du.warning('Non-array results argument');
			return false;
		}

		let result = arrayutilities.serial(results, (current, next) => { return current && next; }, true);

		if(result == true){
			return true;
		}

		if(fatal == true){
			throw eu.getError('server', 'Results array contained one or more failures: '+JSON.stringify(results));
		}

		du.warning('Results array contained one or more failures: '+JSON.stringify(results));

		return false;

	}

	async getAvailableRebillsOverPeriod(){
		let rebill_promises = await Promise.all([
			this.getAvailableRebills(),
			this.getAvailableRebills(timestamp.getPreviousMonthEnd())
		]);

		let rebills = arrayutilities.merge(rebill_promises[0], rebill_promises[1]);

		return arrayutilities.unique(rebills);

	}

	async getAvailableRebills(now = timestamp.getISO8601()){
		return (new RebillHelperController()).getAvailableRebills(now);

	}

	async pushRebillsIntoStateMachine(rebills){
		let results = arrayutilities.map(rebills, rebill => {

			return this.pushRebillIntoStateMachine(rebill);

		});

		return Promise.all(results);

	}

	async pushRebillIntoStateMachine(rebill, fatal = false){
		const trigger_result = await this.pushToBilling(rebill, fatal);

		if(trigger_result != true){

			if(fatal == true){
				throw eu.getError('server','Unable to push rebill into the billing state machine: '+rebill.id);
			}

			du.warning('Unable to push rebill into the billing state machine: '+rebill.id);

			return false;

		}

		const mark_result = await this.markRebillAsProcessing(rebill, fatal);

		if(mark_result !== true){

			if(fatal == true){
				throw eu.getError('server', 'Unable to mark the rebill as processing: '+rebill.id);
			}

			du.warning('Unable to mark the rebill as processing: '+rebill.id);

			return false;

		}

		return true;

	}

	async pushToBilling(rebill, fatal = false){
		const parameters = {
			guid: rebill,
			stateMachineName: 'Billing'
		};

		let result = null;

		try{

			result = await (new StepFunctionTriggerController()).execute(parameters);

		}catch(error){

			if(fatal == true){
				throw error;
			}

			du.warning(error.message);

			return false;

		}

		if(_.has(result, 'executionArn')){
			return true;
		}

		if(fatal == true){
			throw eu.getError('server', 'Unable to push rebill to the billing state machine.');
		}

		du.warning('Unable to push rebill to the billing state machine: '+rebill);

		return false;

	}

	async markRebillAsProcessing(rebill, fatal = true){
		let result = null;

		rebill = await (new RebillController()).get({id: rebill});

		if(_.isNull(rebill)){
			if(fatal == true){
				throw eu.getError('server', 'Unable to acquire rebill.');
			}
			du.warning('Unable to acquire rebill.');
			return false;
		}

		try{

			result = await (new RebillHelperController()).updateRebillProcessing({rebill: rebill, processing: true});

		}catch(error){

			if(fatal == true){
				throw error;
			}

			du.warning(error.message);

		}

		if(!_.isNull(result)){
			return true;
		}

		return false;

	}

	respond(result){
		if(result == true){
			return 'SUCCESS';
		}

		if(_.isNull(result)){
			return 'NOREBILLS';
		}

		if(result == false){
			return 'FAILURE';
		}

		throw eu.getError('server', 'Unexpected response: '+result);

	}

}
