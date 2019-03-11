const EventHandler = require('./event-handler');

const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
const ReIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/ReIndexing.js');
const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');

module.exports = {
	selectrebills: handleEvent((event) => new SelectRebillsController().execute(event)),
	reindex: handleEvent(() => new ReIndexingHelperController().execute()),
	indexdynamorecords: handleEvent((event) => new IndexDynamoRecordsController().execute(event))
};

function handleEvent(delegate) {
	return (event, context, callback) => new EventHandler().handle(event, context, callback, delegate);
}
