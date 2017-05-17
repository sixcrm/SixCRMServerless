'use strict';
require('../../../routes.js');

var LambdaResponse = global.routes.include('lib','lambda-response.js');
var acquireTokenController = global.routes.include('controllers','endpoints/acquireToken.js');

module.exports.acquiretoken = (event, context, callback) => {

    acquireTokenController.execute(event).then((response) => {
        return new LambdaResponse().issueResponse(200, {
            message: 'Success',
            token: response
        }, callback);
    }).catch((error) =>{
        return new LambdaResponse().issueError(error.message, 500, event, error, callback);
    });

}
