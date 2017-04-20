'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
var confirmShippedController = require('../../controllers/workers/confirmShipped.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.confirmshipped = (event, context, callback) => {

    confirmShippedController.execute(event).then((shipped) => {

        if(shipped.message !== confirmShippedController.messages.shipped){

            new LambdaResponse().issueResponse(200, {
                message: shipped.message
            }, callback);

        }else{

            confirmShippedController.createForwardMessage(event).then((forward_object) => {
                new LambdaResponse().issueResponse(200, {
                    message: shipped.message,
                    forward: forward_object
                }, callback);
            });

        }

    }).catch((error) =>{

        return new LambdaResponse().issueError(error.message, 500, event, error, callback);

    });

}