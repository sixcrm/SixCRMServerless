'use strict';
require('../../../routes.js');

const _ = require('underscore');

const timer = global.routes.include('lib', 'timer');
const du = global.routes.include('lib', 'debug-utilities.js');

const LambdaResponse = global.routes.include('lib', 'lambda-response.js');
const graphController = global.routes.include('controllers', 'endpoints/graph.js');

module.exports.graph = (event, context, callback) => {

    let gc = new graphController();

    gc.execute(event).then((result) => {

      return new LambdaResponse().issueSuccess(result, callback);

    })
    .catch((error) =>{

      return new LambdaResponse().issueError(error, event, callback);

    });

}
