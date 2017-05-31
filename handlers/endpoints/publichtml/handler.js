'use strict';
require('../../../routes.js');

var LambdaResponse = global.routes.include('lib', 'lambda-response.js');
var publicHTMLController = global.routes.include('controllers', 'endpoints/publichtml.js');

module.exports.publichtml = (event, context, callback) => {

    publicHTMLController.execute(event).then((response) => {
        return new LambdaResponse().issueResponse(200, response, callback);
    }).catch((error) =>{
        return new LambdaResponse().issueError(error.message, 500, event, error, callback);
    });

};
