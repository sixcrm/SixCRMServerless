const _ = require('lodash')
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class CompleteSessionController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {
		this.validateEvent(event);

		let session = await this.getSession(event.guid);

		await this.closeSession(session);

		return this.respond();

	}

	async closeSession(session){
		session.completed = true;

		if(!_.has(this, 'sessionController')){
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		return this.sessionController.update({entity: session});

	}

	respond(){
		return 'CLOSED';

	}

}
