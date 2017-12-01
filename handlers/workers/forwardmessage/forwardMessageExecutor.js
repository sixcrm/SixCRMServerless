'use strict';
require('../../../SixCRM.js');
const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');

module.exports = (forwardMessageController, event, callback) => {
  return forwardMessageController.execute().then(() => {

    new LambdaResponse().issueResponse(200, {}, callback);

  }).catch((error) =>{

    new LambdaResponse().issueError(error.message, event, callback);

  });
};
