const _ = require('lodash')

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetSessionClosedController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let session = await this.getSession(event.guid);

		let complete = this.isClosed(session);

		return this.respond(complete);

	}

	isClosed(session){

		du.debug('Is Closed');

		if(_.has(session, 'completed') && session.completed == true){
			return true;
		}

		return false;

	}

	respond(complete){

		du.debug('Respond');

		if(complete == true){
			return 'CLOSED';
		}

		return 'NOTCLOSED';

	}

}