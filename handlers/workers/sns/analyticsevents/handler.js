require('../../../../SixCRM.js');

const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
const AnalyticsEventBroker = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-broker.js');
const PermissionUtilities = global.SixCRM.routes.include('lib', 'permission-utilities.js');

PermissionUtilities.disableACLs();

module.exports.analyticsevents = (event, context, callback) => {

	return new AnalyticsEventBroker().execute(event).then((result) => {

		return new LambdaResponse().issueResponse(200, {
			message: result
		}, callback);

	}).catch((error) =>{

		return new LambdaResponse().issueError(error.message, event, callback);

	});

}
