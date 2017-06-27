'use strict';
require('../../../routes.js');

const _ = require('underscore');

var LambdaResponse = global.routes.include('lib', 'lambda-response.js');
var createOrderController = global.routes.include('controllers', 'endpoints/createOrder.js');

module.exports.createorder= (event, context, callback) => {

    createOrderController.execute(event).then((response) => {

        return new LambdaResponse().issueSuccess(response, callback);

    }).catch((error) =>{

        return new LambdaResponse().issueError(error, event, callback);

    });

};
