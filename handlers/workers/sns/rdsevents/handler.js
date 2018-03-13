'use strict';

module.exports.rdsevents = (event, context, callback) => {

  require('../../../../SixCRM.js');

  const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  const RDSEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/RDSEvents.js');

  return RDSEventsController.execute(event).then((result) => {

    return new LambdaResponse().issueResponse(200, {
        message: result
    }, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}
