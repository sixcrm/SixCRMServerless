'use strict';

module.exports = (event, context, callback) => {

  require('../../../SixCRM.js');

  const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  const RebillStateToRedshiftController = global.SixCRM.routes.include('controllers', 'workers/rebillStateToRedshift.js');
  let rsc = new RebillStateToRedshiftController();

  return rsc.execute().then((result) => {

      return new LambdaResponse().issueResponse(200, {message: result}, callback);

  }).catch((error) =>{

      return new LambdaResponse().issueError(error.message, event, callback);

  });

};
