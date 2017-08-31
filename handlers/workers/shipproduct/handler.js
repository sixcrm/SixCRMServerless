'use strict';
require('../../../SixCRM.js');

var LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
var shipProductController = global.SixCRM.routes.include('controllers', 'workers/shipProduct.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.shipproduct = (event, context, callback) => {

    shipProductController.execute(event).then((shipped) => {

        switch(shipped){

        case shipProductController.messages.notified:

            shipProductController.createForwardMessage(event).then((forward_object) => {
                new LambdaResponse().issueResponse(200, {
                    message: shipped ,
                    forward: forward_object
                }, callback);
            });

            break;

        case shipProductController.messages.failed:

            shipProductController.createForwardMessage(event).then((forward_object) => {
                new LambdaResponse().issueResponse(200, {
                    message: shipped ,
                    failed: forward_object
                }, callback);
            });

            break;

        default:
            new LambdaResponse().issueResponse(200, {
                message: shipped.message
            }, callback);
            break;

        }

    }).catch((error) =>{

        return new LambdaResponse().issueError(error.message, event, callback);

    });

}
