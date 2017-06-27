'use strict';
require('../../../routes.js');

const _ = require('underscore');

var LambdaResponse = global.routes.include('lib', 'lambda-response.js');
var createUpsellController = global.routes.include('controllers', 'endpoints/createUpsell.js');

module.exports.createupsell= (event, context, callback) => {

    createUpsellController.execute(event).then((response) => {

      return new LambdaResponse().issueSuccess(response, callback);

    }).catch((error) =>{

        return new LambdaResponse().issueError(error, event, callback);

    });

};
