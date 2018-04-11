'use strict';
require('../../../SixCRM.js');

var LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
var createUpsellController = global.SixCRM.routes.include('controllers', 'endpoints/createUpsell.js');

module.exports.createupsell= (event, context, callback) => {

    createUpsellController.execute(event).then((response) => {

      return new LambdaResponse().issueSuccess(response, callback);

    }).catch((error) =>{

        return new LambdaResponse().issueError(error, event, callback);

    });

};
