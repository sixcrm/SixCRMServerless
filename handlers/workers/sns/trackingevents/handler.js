'use strict';

module.exports.trackingevents = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  const TrackingEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/trackingEvents.js');
  const trackingEventsController = new TrackingEventsController();

  return trackingEventsController.execute(event).then((result) => {

    return new LambdaResponse().issueResponse(200, {message: result}, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}
