'use strict';
require('../../../SixCRM.js');

var LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
var archiveController = global.SixCRM.routes.include('controllers', 'workers/archive.js');

/* eslint-disable promise/always-return */
module.exports.archive = (event, context, callback) => {

    archiveController.execute(event).then((response) => {

        switch(response){
            // eslint-disable-next-line promise/always-return
        case archiveController.messages.success:

            new LambdaResponse().issueResponse(200, {
                message: response,
                forward: {}
            }, callback);

            break;

        default:

            new LambdaResponse().issueResponse(200, {
                message: response
            }, callback);

            break;

        }

    }).catch((error) =>{

        return new LambdaResponse().issueError(error.message, event, callback);

    });

}
