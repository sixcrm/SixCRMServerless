'use strict';

module.exports = (event, context, callback) => {

  require('../../../SixCRM.js');

  const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  let infoController = global.SixCRM.routes.include('controllers', 'endpoints/info.js');

  infoController.execute(event).then((response) => {

    return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error, event, callback);

  });

};
