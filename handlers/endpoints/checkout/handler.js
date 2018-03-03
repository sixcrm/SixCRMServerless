'use strict';

module.exports.checkout = (event, context, callback) => {

  require('../../../SixCRM.js');

  let LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  let checkoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');

  checkoutController.execute(event).then((response) => {

      return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

      return new LambdaResponse().issueError(error, event, callback);

  });

};
