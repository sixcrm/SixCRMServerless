'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
var forwardMessageController = require('../../controllers/workers/forwardMessage.js');

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