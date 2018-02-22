'use strict';
require('../../../../SixCRM.js');

const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const eventEmailsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/eventEmails.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.customeremail = (event, context, callback) => {

  eventEmailsController.execute(event).then((result) => {

    new LambdaResponse().issueResponse(200, {
        message: result
    }, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}
