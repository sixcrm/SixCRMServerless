'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');

var createRebillsController = require('../../controllers/workers/createRebills.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.createrebills = (event, context, callback) => {

    createRebillsController.execute(event).then((result) => {

        if(result !== createRebillsController.messages.success && result !== createRebillsController.messages.successnoaction){

            new LambdaResponse().issueResponse(200, {
                message: result
            }, callback);

        }else{

            createRebillsController.createForwardMessage(event).then((forward_object) => {
                new LambdaResponse().issueResponse(200, {
                    message: result,
                    forward: forward_object
                }, callback);
            });

        }

    }).catch((error) =>{

        return new LambdaResponse().issueError(error.message, 500, event, error, callback);

    });

}