'use strict';
require('../../../routes.js');
var LambdaResponse = global.routes.include('lib', 'lambda-response.js');
var forwardMessageController = global.routes.include('lib', 'workers/forwardMessage.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.forwardmessage = (event, context, callback) => {

    forwardMessageController.execute().then((response) => {

        new LambdaResponse().issueResponse(200, {
            message: response
        }, callback);

    }).catch((error) =>{

        new LambdaResponse().issueError(error.message, 500, event, error, callback);

    });

}
