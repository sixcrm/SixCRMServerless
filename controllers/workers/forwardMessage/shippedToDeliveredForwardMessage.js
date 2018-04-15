
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class ShippedToDeliveredForwardMessageController extends forwardRebillMessageController {

	constructor(){

		super();

		this.parameters.set('params', {
			name: 'shippedtodelivered',
			workerfunction: 'confirmDelivered.js',
			origin_queue: 'shipped',
			failure_queue: 'shipped_failed',
			error_queue: 'shipped_error',
			destination_queue: 'delivered'
		})

	}

};
