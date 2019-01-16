
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class HoldToArchivedForwardMessageController extends forwardRebillMessageController {

	constructor(){

		super();

		this.parameters.set('params', {
			name: 'holdtoarchive',
			workerfunction: 'archive.js',
			origin_queue: 'hold',
			failure_queue: 'hold_failed',
			error_queue: 'hold_error'
		})

	}

};
