'use strict';
require('../../../SixCRM.js');

const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
const graphController = global.SixCRM.routes.include('controllers', 'endpoints/graph.js');

module.exports.graph = (event, context, callback) => {

    let gc = new graphController();

    gc.execute(event).then((result) => {

      return new LambdaResponse().issueSuccess(result, callback);

    })
    .catch((error) =>{

      return new LambdaResponse().issueError(error, event, callback);

    });

}
