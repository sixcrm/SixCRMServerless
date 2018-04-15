
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class PendingToShippedForwardMessageController extends forwardRebillMessageController {

	constructor(){

		super();

		this.parameters.set('params', {
			name: 'pendingtoshipped',
			workerfunction: 'confirmShipped.js',
			origin_queue: 'pending',
			failure_queue: 'pending_failed',
			error_queue: 'pending_error',
			destination_queue: 'shipped'
		})

	}

};
