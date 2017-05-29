'use strict';
require('../../../routes.js');

var LambdaResponse = global.routes.include('lib', 'lambda-response.js');
var publicController = global.routes.include('controllers', 'endpoints/public.js');

module.exports.public = (event, context, callback) => {

    publicController.execute(event).then((response) => {
        return new LambdaResponse().issueResponse(200, response, callback);
    }).catch((error) =>{
        return new LambdaResponse().issueError(error.message, 500, event, error, callback);
    });

};
