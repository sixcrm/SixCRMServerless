'use strict';
require('../../../routes.js');

var LambdaResponse = global.routes.include('lib', 'lambda-response.js');
var createLeadController = global.routes.include('controllers', 'endpoints/createLead.js');

module.exports.createlead = (event, context, callback) => {

    createLeadController.execute(event).then((response) => {

        return new LambdaResponse().issueSuccess(response, callback);

    }).catch((error) =>{

        return new LambdaResponse().issueError(error, event, callback);

    });

};
