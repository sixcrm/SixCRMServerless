'use strict';

module.exports = (event, context, callback) => {

  require('../../../SixCRM.js');

  const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  const ReIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/ReIndexing.js');

  new ReIndexingHelperController().execute(true).then((result) => {

    return new LambdaResponse().issueResponse(200, {message: result}, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

};
