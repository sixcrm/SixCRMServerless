const _ = require('lodash')

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class CloseSessionController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let session = await this.getSession(event.guid);

		await this.closeSession(session);

		return this.respond();

	}

	async closeSession(session){

		du.debug('Close Session');

		session.completed = true;

		if(!_.has(this, 'sessionController')){
			const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
			this.sessionController = new SessionController();
		}

		return this.sessionController.update({entity: session});

	}

	respond(){

		du.debug('Respond');

		return 'CLOSED';

	}

}
