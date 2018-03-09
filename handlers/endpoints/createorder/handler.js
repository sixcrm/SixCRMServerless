'use strict';

module.exports.createorder = (event, context, callback) => {

  require('../../../SixCRM.js');
  global.SixCRM.clearState();

  let LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

  createOrderController.execute(event).then((response) => {

      return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

      return new LambdaResponse().issueError(error, event, callback);

  });

};
