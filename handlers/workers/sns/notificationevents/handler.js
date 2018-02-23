'use strict';
require('../../../../SixCRM.js');

const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const notificationEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/notificationEvents.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.notificationevents = (event, context, callback) => {

  notificationEventsController.execute(event).then((result) => {

    new LambdaResponse().issueResponse(200, {
        message: result
    }, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}
