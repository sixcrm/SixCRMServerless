'use strict';

module.exports.createlead = (event, context, callback) => {

  require('../../../SixCRM.js');

  var LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
  var createLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');

  createLeadController.execute(event).then((response) => {

      return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

      return new LambdaResponse().issueError(error, event, callback);

  });

};
