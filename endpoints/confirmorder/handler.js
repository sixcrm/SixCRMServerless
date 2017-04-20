'use strict';
var LambdaResponse = require('../../lib/lambda-response.js');
var confirmOrderController = require('../../controllers/endpoints/confirmOrder.js');

module.exports.confirmorder = (event, context, callback) => {

    confirmOrderController.execute(event).then((response) => {
        return new LambdaResponse().issueResponse(200, {
            message: 'Success',
            results: response
        }, callback);
    }).catch((error) =>{
        return new LambdaResponse().issueError(error.message, 500, event, error, callback);
    });

};