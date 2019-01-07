
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class HoldToPendingForwardMessageController extends forwardRebillMessageController {

	constructor(){

		super();

		this.parameters.set('params', {
			name: 'holdtopending',
			origin_queue: 'hold',
			destination_queue: 'pending',
			failure_queue: 'hold_failed',
			error_queue: 'hold_error',
			workerfunction: 'shipProduct.js'
		})

	}

};
