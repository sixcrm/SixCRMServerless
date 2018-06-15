const _ = require('lodash')

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetRebillSessionController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		if(_.has(event, 'session')){

			let session = await this.getSession(event.session);

			return this.respond(session);

		}

		let rebill = await this.getRebill(event.guid);

		let session = await this.getSession(rebill.parentsession);

		return this.respond(session);

	}

	respond(session){

		du.debug('Respond');

		return session.id;

	}

}
