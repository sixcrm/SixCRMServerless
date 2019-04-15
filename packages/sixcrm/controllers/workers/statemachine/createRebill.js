const _ = require('lodash');
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class CreateRebillController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {
		this.validateEvent(event);

		const session = await this.getSession(event.guid);
		await this.createProductSetupService(session.account);

		const rebill = await this.createRebill(session);

		return this.respond(rebill);
	}

	async createRebill(session, fatal = false){
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
		if(_.isObject(rebill) && _.has(rebill, 'id')){
			return 'REBILLCREATED';
		}

		if(_.includes(['CONCLUDED', 'CONCLUDE', 'CANCELLED', 'INCOMPLETE', 'CONFIRMATION_REQUIRED'], rebill)){
			return rebill;
		}

		if(_.isNull(rebill) || _.isError(rebill)){
			return 'FAILED';
		}

		du.error(rebill);
		throw eu.getError('server', 'Unknown rebill state', rebill);

	}

}
