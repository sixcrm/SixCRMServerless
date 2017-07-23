'use strict';
require('../../../SixCRM.js');

var LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
var confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

module.exports.confirmorder = (event, context, callback) => {

    confirmOrderController.execute(event).then((response) => {

        return new LambdaResponse().issueSuccess(response, callback);

    }).catch((error) =>{

        return new LambdaResponse().issueError(error, event, callback);

    });

};
