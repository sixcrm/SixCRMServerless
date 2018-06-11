const _ = require('lodash')

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetSessionRebillController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let session = await this.getSession(event.guid);

		let rebill = await this.getMostRecentRebill(session);

		return this.respond(rebill);

	}

	async getMostRecentRebill(session){

		du.debug('Get Most Recent Rebill');

		let rebill = await (new RebillHelperController()).getMostRecentRebill({session: session});

		if(_.isNull(rebill) || !_.has(rebill, 'id')){
			throw eu.getError('server', 'Unexpected state:  Session does not have a recent rebill that does not have processing = false.');
		}

		return rebill;

	}

	respond(rebill){

		du.debug('Respond');

		return rebill.id;

	}

}
