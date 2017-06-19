'use strict';
require('../../../routes.js');

const timer = global.routes.include('lib', 'timer');

const LambdaResponse = global.routes.include('lib', 'lambda-response.js');
const graphController = global.routes.include('controllers', 'endpoints/graph.js');

module.exports.graph = (event, context, callback) => {

    let response;
    let gc = new graphController();

    gc.execute(event).then((result) => {

        response = new LambdaResponse().issueResponse(200, result, callback);
        return response;

    })
    .catch((error) =>{
        response = new LambdaResponse().issueError(error, 500, event, error, callback);
        return response;
    });

}
