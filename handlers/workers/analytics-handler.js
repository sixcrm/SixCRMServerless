const LambdaHandler = require('../lambda-handler');
const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
const AnalyticsEventHandler = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-handler.js');
const auroraContext = global.SixCRM.routes.include('lib', 'analytics/aurora-context');

module.exports = class AnalyticsHandler extends LambdaHandler {

	async handleInternal(event, lambdaContext, lambdaCallback) {

		try {

			const queue = global.SixCRM.configuration.isLocal() ? 'analytics' : 'analytics.fifo';
			const analyticsEventHandler = new AnalyticsEventHandler(queue, auroraContext);
			await analyticsEventHandler.execute();

			return new LambdaResponse().issueSuccess({}, lambdaCallback, 'success');

		} catch(error) {

			return new LambdaResponse().issueError(error.message, event, lambdaCallback);

		}

	}

}
