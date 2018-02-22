'use strict';
require('../../../SixCRM.js');

const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const trackingController = global.SixCRM.routes.include('controllers', 'workers/snsevent/tracking.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.tracking = (event, context, callback) => {

  trackingController.execute(event).then((result) => {

    new LambdaResponse().issueResponse(200, {
        message: result
    }, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}
