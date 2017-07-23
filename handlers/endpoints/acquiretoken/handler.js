'use strict';
require('../../../SixCRM.js');

var LambdaResponse = global.SixCRM.routes.include('lib','lambda-response.js');
var acquireTokenController = global.SixCRM.routes.include('controllers','endpoints/acquireToken.js');

module.exports.acquiretoken = (event, context, callback) => {

    acquireTokenController.execute(event).then((response) => {

        return new LambdaResponse().issueSuccess(response, callback);

    }).catch((error) =>{

        return new LambdaResponse().issueError(error, event, callback);

    });

}
