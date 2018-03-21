require('../../../../SixCRM.js');

module.exports.analyticsevents = (event, context, callback) => {

  const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  const AnalyticsEventBroker = global.SixCRM.routes.include('controllers', 'workers/analytics/analytics-event-broker.js');

  return AnalyticsEventBroker.execute(event).then((result) => {

    return new LambdaResponse().issueResponse(200, {
        message: result
    }, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}
