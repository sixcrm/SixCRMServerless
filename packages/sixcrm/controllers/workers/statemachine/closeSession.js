const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const sessionController = new SessionController();

module.exports = class CloseSessionController extends stepFunctionWorkerController {
	constructor() {
		super();
	}

	async execute(event) {
		this.validateEvent(event);

		let session = await this.getSession(event.guid);
		session.completed = true;
		await sessionController.update({entity: session});

		return this.respond();
	}

	respond(){
		return 'CLOSED';
	}
}
