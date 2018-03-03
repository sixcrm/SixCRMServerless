'use strict';

module.exports = (event, context, callback) => {

  require('../../../SixCRM.js');

  let LambdaResponse = global.SixCRM.routes.include('lib','lambda-response.js');
  let acquireTokenController = global.SixCRM.routes.include('controllers','endpoints/acquireToken.js');

  acquireTokenController.execute(event).then((response) => {

      return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

      return new LambdaResponse().issueError(error, event, callback);

  });

}
