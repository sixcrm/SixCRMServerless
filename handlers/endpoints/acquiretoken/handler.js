'use strict';

module.exports.acquiretoken = (event, context, callback) => {

  require('../../../SixCRM.js');

  let LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
  let AcquireTokenController = global.SixCRM.routes.include('controllers','endpoints/acquireToken.js');
  let acquireTokenController = new AcquireTokenController();

  acquireTokenController.execute(event).then((response) => {

      return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

      return new LambdaResponse().issueError(error, event, callback);

  });

}
