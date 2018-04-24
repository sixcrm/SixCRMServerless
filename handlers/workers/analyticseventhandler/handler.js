require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
const AnalyticsEventHandler = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-handler.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context');
const PermissionUtilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');

PermissionUtilities.disableACLs();

module.exports.analyticseventhandler = (event, context, callback) => {

	const queue = global.SixCRM.configuration.isLocal() ? 'analytics' : 'analytics.fifo';
	const analyticsEventHandler = new AnalyticsEventHandler(queue, auroraContext);

	Promise.resolve()
		.then(() => analyticsEventHandler.execute())
		.then(() => {

			return new LambdaResponse().issueSuccess({}, callback, 'success');

		})
		.catch((ex) => {

			return new LambdaResponse().issueError(ex.message, event, callback);

		})

};
