require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('lib', 'providers/lambda-response.js');
const AnalyticsEventHandler = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-handler.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context');

module.exports.analyticseventhandler = (event, context, callback) => {

	const analyticsEventHandler = new AnalyticsEventHandler('rds_transaction_batch', auroraContext);

	Promise.resolve()
		.then(() => analyticsEventHandler.execute())
		.then(() => {

			return new LambdaResponse().issueSuccess({}, callback, 'success');

		})
		.catch((ex) => {

			return new LambdaResponse().issueError(ex.message, event, callback);

		})

};