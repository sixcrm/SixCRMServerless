'use strict';

module.exports = (event, context, callback) => {

  require('../../../SixCRM.js');

  let LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  let confirmOrderController = global.SixCRM.routes.include('controllers', 'endpoints/confirmOrder.js');

  confirmOrderController.execute(event).then((response) => {

    return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error, event, callback);

  });

};
