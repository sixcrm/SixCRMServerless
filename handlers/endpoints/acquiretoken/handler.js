'use strict';
require('../../../routes.js');

var LambdaResponse = global.routes.include('lib','lambda-response.js');
var acquireTokenController = global.routes.include('controllers','endpoints/acquireToken.js');

module.exports.acquiretoken = (event, context, callback) => {

    acquireTokenController.execute(event).then((response) => {

        return new LambdaResponse().issueSuccess(response, callback);

    }).catch((error) =>{

        return new LambdaResponse().issueError(error, event, callback);

    });

}
