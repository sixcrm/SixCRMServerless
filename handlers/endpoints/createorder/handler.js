'use strict';

module.exports = (event, context, callback) => {

  require('../../../SixCRM.js');
  global.SixCRM.clearState();

  let du = global.SixCRM.routes.include('lib','debug-utilities.js');
  let LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  let createOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');

  du.debug(event, context);

  createOrderController.execute(event).then((response) => {

      return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

      return new LambdaResponse().issueError(error, event, callback);

  });

};
