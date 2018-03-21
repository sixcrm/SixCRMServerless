'use strict';

require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const AnalyticsEventHandler = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-handler.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context');

module.exports.analyticseventhandler = (event, context, callback) => {

	const analyticsEventHandler = new AnalyticsEventHandler();

	Promise.resolve()
		.then(() => auroraContext.init())
		.then(() => analyticsEventHandler.execute())
		.then(() => auroraContext.dispose())
		.then(() => {

			return new LambdaResponse().issueSuccess({}, callback, 'success');

		})
		.catch((ex) => {

			return new LambdaResponse().issueError(ex.message, event, callback);

		})

};