const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const StepFunctionTriggerController = global.SixCRM.routes.include('workers','statemachine/components/stepFunctionTrigger.js');
const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

module.exports = class SelectRebillsController extends workerController {

	constructor(){

		super();

	}

	async execute(){

		du.debug('Execute');

		let rebills = await this.getAvailableRebills();

		let result = null;

		if(_.isArray(rebills) && arrayutilities.nonEmpty(rebills)){
			result = await this.pushRebillsIntoStateMachine(rebills);
		}else{
			du.info('No available rebills');
		}

		this.respond(result);

	}

	async getAvailableRebills(){

		du.debug('Get Available Rebills');

		let rebills = await (new RebillHelperController()).getAvailableRebills();

		if(!_.isNull(rebills) && _.isArray(rebills) && arrayutilities.nonEmpty(rebills)){
			return rebills;
		}

		return [];

	}

	async pushRebillsIntoStateMachine(rebills){

		du.debug('Push Rebills Into State Machine');

		let results = arrayutilities.map(rebills, rebill => {

			return this.pushRebillIntoStateMachine(rebill);

		});

		return Promise.all(results);

	}

	async pushRebillIntoStateMachine(rebill, fatal = false){

		du.debug('Push Rebill Into State Machine');

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

		du.debug('Push To Billing');

		const parameters = {
			guid: rebill.id,
			stateMachineName: 'Billing'
		};

		let result = null;

		try{

			result = await (new StepFunctionTriggerController()).execute(parameters, true);

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

		du.warning('Unable to push rebill to the billing state machine: '+rebill.id);

		return false;

	}

	async markRebillAsProcessing(rebill, fatal = true){

		du.debug('Mark Rebill As Processing');

		let result = null;

		try{

			result = await this.rebillHelperController.updateRebillProcessing({rebill: rebill, processing: true});

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

		du.debug('Respond');

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
