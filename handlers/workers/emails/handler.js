'use strict';
require('../../../SixCRM.js');

const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const eventEmailsController = global.SixCRM.routes.include('controllers', 'workers/eventEmails.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.emails = (event, context, callback) => {

  eventEmailsController.execute(event).then((result) => {

    new LambdaResponse().issueResponse(200, {
        message: result
    }, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

}
