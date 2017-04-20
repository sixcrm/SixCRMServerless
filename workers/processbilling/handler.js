'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
var processBillingController = require('../../controllers/workers/processBilling.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.processbilling = (event, context, callback) => {

    processBillingController.execute(event).then((result) => {

        switch(result){

        case processBillingController.messages.success:

            processBillingController.createForwardMessage(event).then((forward_object) => {
                new LambdaResponse().issueResponse(200, {
                    message: result ,
                    forward: forward_object
                }, callback);
            });

            break;

        case processBillingController.messages.failed:

            processBillingController.createForwardMessage(event).then((forward_object) => {
                new LambdaResponse().issueResponse(200, {
                    message: result ,
                    failed: forward_object
                }, callback);
            });

            break;

        default:

            new LambdaResponse().issueResponse(200, {
                message: result.message
            }, callback);
            break;

        }

    }).catch((error) =>{

        return new LambdaResponse().issueError(error.message, 500, event, error, callback);

    });

}