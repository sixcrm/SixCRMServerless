
const forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

module.exports = class IndexToArchivedForwardMessageController extends forwardMessageController {

	constructor(){

		super();

		this.parameters.set('params', {
			name: 'indextoarchive',
			origin_queue: 'search_indexing',
			failure_queue: 'search_indexing_failed',
			workerfunction: 'indexEntities.js',
			error_queue: 'search_indexing_error',
			bulk: true
		})

	}

};
