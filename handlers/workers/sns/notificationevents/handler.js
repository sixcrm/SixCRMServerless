'use strict';

module.exports.notificationevents = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  const notificationEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/notificationEvents.js');

  return notificationEventsController.execute(event).then((result) => {

    return new LambdaResponse().issueResponse(200, {
        message: result
    }, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}
