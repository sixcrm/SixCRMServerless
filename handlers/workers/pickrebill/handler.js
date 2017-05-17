'use strict';
require('../../../routes.js');
var LambdaResponse = global.routes.include('lib', 'lambda-response.js');

var pickRebillController = global.routes.include('controllers', 'workers/pickRebill.js');

/* eslint-disable promise/always-return, promise/catch-or-return */
module.exports.pickrebill = (event, context, callback) => {

    pickRebillController.execute().then((result) => {

        new LambdaResponse().issueResponse(200, {
            message: result
        }, callback);

    }).catch((error) =>{

        return new LambdaResponse().issueError(error.message, 500, event, error, callback);

    });

}
