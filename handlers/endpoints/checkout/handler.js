'use strict';
require('../../../SixCRM.js');

var LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
var checkoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');

module.exports.checkout = (event, context, callback) => {

  checkoutController.execute(event).then((response) => {

      return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

      return new LambdaResponse().issueError(error, event, callback);

  });

};
