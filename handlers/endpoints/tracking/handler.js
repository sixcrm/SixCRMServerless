'use strict';

module.exports = (event, context, callback) => {

  require('../../../SixCRM.js');

  const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  let trackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

  trackingController.execute(event).then((response) => {

    return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error, event, callback);

  });

};
