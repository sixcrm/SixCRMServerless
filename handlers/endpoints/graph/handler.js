'use strict';
require('../../../routes.js');

const _ = require('underscore');

const timer = global.routes.include('lib', 'timer');
const du = global.routes.include('lib', 'debug-utilities.js');

const LambdaResponse = global.routes.include('lib', 'lambda-response.js');
const graphController = global.routes.include('controllers', 'endpoints/graph.js');

module.exports.graph = (event, context, callback) => {

    let response;
    let gc = new graphController();

    gc.execute(event).then((result) => {

      if(_.has(result, 'errors') && _.isArray(result.errors) && result.errors.length > 0){

        response = new LambdaResponse().issueError(result.errors[0], event, callback);
        return response;

      }

      response = new LambdaResponse().issueSuccess(result, callback);
      return response;

    })
    .catch((error) =>{

        response = new LambdaResponse().issueError(error, event, callback);
        return response;

    });

}
