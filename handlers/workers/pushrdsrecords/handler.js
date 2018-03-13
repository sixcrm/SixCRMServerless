'use strict';

module.exports.pushrdsrecords = (event, context, callback) => {

  require('../../../SixCRM.js');

  const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  const PushRDSRecordsController = global.SixCRM.routes.include('controllers', 'workers/sqs/PushRDSRecords.js');

  new PushRDSRecordsController().execute(true).then((result) => {

    return new LambdaResponse().issueResponse(200, {message: result}, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error.message, event, callback);

  });

};
