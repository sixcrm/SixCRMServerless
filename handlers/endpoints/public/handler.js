'use strict';
require('../../../routes.js');

var LambdaResponse = global.routes.include('lib', 'lambda-response.js');
var htmlController = global.routes.include('controllers', 'endpoints/html.js');

module.exports.public = (event, context, callback) => {

    htmlController.execute(event).then((response) => {
        return new LambdaResponse().issueResponse(200, response, callback);
    }).catch((error) =>{
        return new LambdaResponse().issueError(error.message, 500, event, error, callback);
    });

};
