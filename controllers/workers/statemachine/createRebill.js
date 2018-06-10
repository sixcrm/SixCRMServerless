const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class CreateRebillController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let session = await this.getSession(event.guid);

		await this.cleanupSession(session);

		return this.respond();

	}

	async cleanupSession(session){

		du.debug('Cleanup Session');

		du.info(session);

		//consolidate rebills
		//mark rebill as ready to process

		return true;

	}

	respond(){

		du.debug('Respond');

		return true;

	}

}
