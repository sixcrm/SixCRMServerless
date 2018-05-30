
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class BillToHoldForwardMessageController extends forwardRebillMessageController {

	constructor(){

		super();

		this.parameters.set('params', {
			name: 'billtohold',
			origin_queue: 'bill',
			destination_queue: 'hold',
			failure_queue: 'recover',
			workerfunction: 'processBilling.js',
			error_queue: 'bill_error'
		})

	}

};
