const _ = require('lodash')

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetSessionClosedController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {
		this.validateEvent(event);

		let session = await this.getSession(event.guid);

		let complete = this.isClosed(session);

		return this.respond(complete);

	}

	isClosed(session){
		if(_.has(session, 'completed') && session.completed == true){
			return true;
		}

		return false;

	}

	respond(complete){
		if(complete == true){
			return 'CLOSED';
		}

		return 'NOTCLOSED';

	}

}
