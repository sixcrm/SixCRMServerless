'use strict';
require('../../../routes.js');

var LambdaResponse = global.routes.include('lib', 'lambda-response.js');
let graphController = global.routes.include('controllers', 'endpoints/graph.js');

module.exports.graph = (event, context, callback) => {

    graphController.execute(event).then((result) => {
        return new LambdaResponse().issueResponse(200, result, callback);
    })
    .catch((error) =>{
        return new LambdaResponse().issueError(error, 500, event, error, callback);
    });

}
