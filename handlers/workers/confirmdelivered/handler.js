'use strict';
require('../../../SixCRM.js');

var LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
var confirmDeliveredController = global.SixCRM.routes.include('controllers', 'workers/confirmDelivered.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.confirmdelivered = (event, context, callback) => {

    confirmDeliveredController.execute(event).then((delivered) => {

        if(delivered.message !== confirmDeliveredController.messages.delivered){

            new LambdaResponse().issueResponse(200, {
                message: delivered.message
            }, callback);

        }else{

            confirmDeliveredController.createForwardMessage(event).then((forward_object) => {
                new LambdaResponse().issueResponse(200, {
                    message: 'DELIVERED',
                    forward: forward_object
                }, callback);
            });

        }

    }).catch((error) =>{

        return new LambdaResponse().issueError(error.message, 500, event, error, callback);

    });

}
