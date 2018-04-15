
const forwardSessionMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardSessionMessage.js');

module.exports = class RebillToArchivedForwardMessageController extends forwardSessionMessageController {

	constructor(){

		super();

		this.parameters.set('params', {
			name: 'rebilltoarchive',
			workerfunction: 'createRebills.js',
			origin_queue: 'rebill',
			failure_queue: 'rebill_failed',
			error_queue: 'rebill_error'
		})

	}

};
