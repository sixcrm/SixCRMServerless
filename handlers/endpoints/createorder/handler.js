'use strict';
require('../../../routes.js');

const _ = require('underscore');

var LambdaResponse = global.routes.include('lib', 'lambda-response.js');
var createOrderController = global.routes.include('controllers', 'endpoints/createOrder.js');

module.exports.createorder= (event, context, callback) => {

    createOrderController.execute(event).then((response) => {

        if(_.has(response, 'errors') && _.isArray(response.errors) && response.errors.length > 0){

          response = new LambdaResponse().issueError(response.errors[0], event, callback);
          return response;

        }

        response = new LambdaResponse().issueSuccess(response, callback);
        return response;

    }).catch((error) =>{

        return new LambdaResponse().issueError(error, event, callback);

    });

};
