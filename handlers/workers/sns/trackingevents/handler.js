'use strict';
require('../../../../SixCRM.js');

const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const trackingEventsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/trackingEvents.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.trackingevents = (event, context, callback) => {

  trackingEventsController.execute(event).then((result) => {

    new LambdaResponse().issueResponse(200, {
        message: result
    }, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}
