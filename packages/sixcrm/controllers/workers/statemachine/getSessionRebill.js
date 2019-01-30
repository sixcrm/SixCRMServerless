const _ = require('lodash')

const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetSessionRebillController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {
		this.validateEvent(event);

		if(_.has(event, 'rebill')){

			let rebill = await this.getRebill(event.rebill);

			return this.respond(rebill);

		}

		let session = await this.getSession(event.guid);

		let rebill = await this.getMostRecentRebill(session);

		return this.respond(rebill);

	}

	async getMostRecentRebill(session){
		let rebill = await (new RebillHelperController()).getMostRecentRebill({session: session});

		if(_.isNull(rebill) || !_.has(rebill, 'id')){
			throw eu.getError('server', 'Unexpected state:  Session does not have a recent rebill that does not have processing = false.', rebill);
		}

		return rebill;

	}

	respond(rebill){
		return rebill.id;

	}

}
