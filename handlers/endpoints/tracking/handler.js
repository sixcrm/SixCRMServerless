'use strict';

module.exports.tracking = (event, context, callback) => {

  require('../../../SixCRM.js');

  const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
  let TrackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');
  const trackingController = new TrackingController();

  trackingController.execute(event).then((response) => {

    return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error, event, callback);

  });

};
