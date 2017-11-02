'use strict';
require('../../../SixCRM.js');
var LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
var forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.forwardmessage = (event, context, callback) => {

  return forwardMessageController.execute().then(() => {

    new LambdaResponse().issueResponse(200, {}, callback);

  }).catch((error) =>{

    new LambdaResponse().issueError(error.message, event, callback);

  });

}
