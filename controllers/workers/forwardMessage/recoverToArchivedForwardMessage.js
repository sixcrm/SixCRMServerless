
const forwardRebillMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardRebillMessage.js');

module.exports = class RecoverToArchivedForwardMessageController extends forwardRebillMessageController {

	constructor(){

		super();

		this.parameters.set('params', {
			name: 'recovertoarchive',
			workerfunction: 'archive.js',
			origin_queue: 'recover',
			failure_queue: 'recover_failed',
			error_queue: 'recover_error'
		})

	}

};
