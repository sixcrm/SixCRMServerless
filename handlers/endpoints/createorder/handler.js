'use strict';
require('../../../routes.js');
var LambdaResponse = global.routes.include('lib', 'lambda-response.js');
var createOrderController = global.routes.include('controllers', 'endpoints/createOrder.js');

module.exports.createorder= (event, context, callback) => {

    createOrderController.execute(event).then((response) => {
        return new LambdaResponse().issueResponse(200, {
            message: 'Success',
            results: response
        }, callback);
    }).catch((error) =>{
        return new LambdaResponse().issueError(error.message, 500, event, error, callback);
    });

};
