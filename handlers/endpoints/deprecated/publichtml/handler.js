
require('../../../SixCRM.js');
const _ = require('lodash');

var LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
var publicHTMLController = global.SixCRM.routes.include('controllers', 'endpoints/publichtml.js');

module.exports.publichtml = (event, context, callback) => {

    publicHTMLController.execute(event).then((response) => {

        if(_.has(response, 'errors') && _.isArray(response.errors) && response.errors.length > 0){

          response = new LambdaResponse().issueError(response.errors[0], event, callback);
          return response;

        }

        response = new LambdaResponse().issueSuccess(response, callback);
        return response;

    }).catch((error) =>{

        return new LambdaResponse().issueError(error, event, callback);

    });

};
