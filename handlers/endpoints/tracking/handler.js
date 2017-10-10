'use strict';
require('../../../SixCRM.js');

const _ = require('underscore');

const LambdaResponse = global.SixCRM.routes.include('lib', 'lambda-response.js');
let trackingController = global.SixCRM.routes.include('controllers', 'endpoints/tracking.js');

module.exports.tracking = (event, context, callback) => {

  trackingController.execute(event).then((response) => {

    return new LambdaResponse().issueSuccess(response, callback);

  }).catch((error) =>{

    return new LambdaResponse().issueError(error, event, callback);

  });

};
