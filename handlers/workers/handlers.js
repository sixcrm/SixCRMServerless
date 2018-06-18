const AnalyticsHandler = require('./analytics-handler');
const EventHandler = require('./event-handler');

const SelectRebillsController = global.SixCRM.routes.include('controllers', 'workers/selectRebills.js');
const ReIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/ReIndexing.js');
const IndexDynamoRecordsController = global.SixCRM.routes.include('controllers', 'workers/indexDynamoRecords.js');

module.exports = {
	analyticseventhandler: handleAnalytics(),
	selectrebills: handleEvent((event) => new SelectRebillsController().execute(event)),
	reindex: handleEvent(() => new ReIndexingHelperController().execute()),
	indexdynamorecords: handleEvent((event) => new IndexDynamoRecordsController().execute(event))
};

function handleAnalytics() {
	return (event, context, callback) => new AnalyticsHandler().handle(event, context, callback);
}

function handleEvent(delegate) {
	return (event, context, callback) => new EventHandler().handle(event, context, callback, delegate);
}
