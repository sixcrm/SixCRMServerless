'use strict';
require('../../../SixCRM.js');

const _ = require('underscore');

var LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
var createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

module.exports.createorder= (event, context, callback) => {

    createOrderController.execute(event).then((response) => {

        return new LambdaResponse().issueSuccess(response, callback);

    }).catch((error) =>{

        return new LambdaResponse().issueError(error, event, callback);

    });

};
