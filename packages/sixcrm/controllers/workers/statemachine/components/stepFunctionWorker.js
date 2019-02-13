const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;
const { createProductSetupService } = require('@6crm/sixcrm-product-setup');

const StateMachineHelperController = global.SixCRM.routes.include('helpers', 'statemachine/StateMachine.js');

const WorkerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');

const getEnvironmentAuroraHost = () => global.SixCRM.configuration.getEnvironmentConfig(`aurora_host`);
const getAuroraConfig = async () => {
	const {
		host = await getEnvironmentAuroraHost(),
		user: username,
		password
	} = global.SixCRM.configuration.site_config.aurora;
	return {
		host,
		username,
		password
	};
};

module.exports = class StepFunctionWorkerController extends WorkerController {

	constructor(){

		super();

	}

	validateEvent(event){
		du.info('Input event: '+JSON.stringify(event));

		if(!_.has(event, 'guid')){
			throw eu.getError('bad_request', 'Expected property "guid" in the event object');
		}

		if(!stringutilities.isUUID(event.guid)){
			throw eu.getError('bad_request', 'Expected property "guid" to be a UUIDV4');
		}

		return event;

	}

	getShippingReceipt(id, fatal = true){
		return new StateMachineHelperController().getShippingReceipt(id, fatal);

	}

	getRebill(id, fatal = true){
		return new StateMachineHelperController().getRebill(id, fatal);

	}

	getSession(id, fatal = true){
		return new StateMachineHelperController().getSession(id, fatal);

	}

	getAccount(event){
		return new StateMachineHelperController().getAccount(event);

	}

	async createProductSetupService(accountId) {
		const auroraConfig = await getAuroraConfig();
		const productSetupServiceOptions = {
			accountId,
			...auroraConfig
		};
		return createProductSetupService(productSetupServiceOptions);
	}
}
