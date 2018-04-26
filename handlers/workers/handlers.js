const AnalyticsHandler = require('./analytics-handler');

module.exports = {
	analyticseventhandler: handleAnalytics(),
};

function handleAnalytics() {
	return (event, context, callback) => new AnalyticsHandler().handle(event, context, callback);
}
