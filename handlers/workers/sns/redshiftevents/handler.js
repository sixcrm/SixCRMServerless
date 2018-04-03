'use strict';

module.exports.redshiftevents = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const LambdaResponse = global.SixCRM.routes.include('lib', 'providers/lambda-response.js');
  const RedshiftEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/redshiftEvents.js');
  const redshiftEventsController =  new RedshiftEventsController();

  return redshiftEventsController.execute(event).then((result) => {

    return new LambdaResponse().issueResponse(200, {
        message: result
    }, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}
