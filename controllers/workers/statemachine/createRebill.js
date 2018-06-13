const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class CreateRebillController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let session = await this.getSession(event.guid);

		let rebill = await this.createRebill(session);

		return this.respond(rebill);

	}

	async createRebill(session, fatal = false){

		du.debug('Create Rebill');

		let rebill = null;

		try {

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			rebill = (new RebillCreatorHelperController()).createRebill({session: session});

		}catch(error){

			du.warning(error.message);

			if(fatal == true){
				throw error;
			}

			rebill = error;

		}

		return rebill;

	}

	respond(rebill){

		du.debug('Respond');

		if(_.isObject(rebill) && _.has(rebill, 'id')){
			return 'REBILLCREATED';
		}

		if(_.includes(['CONCLUDED', 'CONCLUDE', 'CANCELLED', 'INCOMPLETE'], rebill)){
			return rebill;
		}

		if(_.isNull(rebill) || _.isError(rebill)){
			return 'FAILED';
		}

		throw eu.getError('server', 'Unknown rebill state');

	}

}
