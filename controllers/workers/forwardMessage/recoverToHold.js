
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class RecoverToHoldForwardMessageController extends forwardRebillMessageController {

	constructor(){

		super();

		this.parameters.set('params', {
			name: 'recovertohold',
			origin_queue: 'recover',
			destination_queue: 'hold',
			workerfunction: 'recoverBilling.js',
			failure_queue: 'recover_failed',
			error_queue: 'recover_error'
		});

	}

};
