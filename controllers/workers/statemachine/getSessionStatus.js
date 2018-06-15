const _ = require('lodash')

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

module.exports = class GetSessionStatusController extends stepFunctionWorkerController {

	constructor() {

		super();

	}

	async execute(event) {

		du.debug('Execute');

		this.validateEvent(event);

		let session = await this.getSession(event.guid);

		let status = this.getStatus(session);

		return this.respond(status);

	}

	getStatus(session){

		if(this.isOpen(session)){
			return 'INCOMPLETE';
		}

		if(this.isCancelled(session)){
			return 'CANCELLED';
		}

		if(this.isConcluded(session)){
			return 'CONCLUDED';
		}

		return 'ACTIVE';

	}

	isOpen(session){

		du.debug('Is Open');

		if(!_.has(session, 'completed') || session.completed != true){
			return true;
		}

		return false;

	}

	isConcluded(session){

		du.debug('Is Concluded');

		if(_.has(session, 'concluded') && session.concluded == true){
			return true;
		}

		return false;

	}

	isCancelled(session){

		du.debug('Is Concluded');

		if(_.has(session, 'cancelled') && _.has(session.cancelled, 'cancelled') && session.cancelled.cancelled == true){
			return true;
		}

		return false;

	}

	respond(status){

		du.debug('Respond');

		return status;

	}

}
