'use strict';
const validator = require('validator');

require('../../../routes.js');

var policy_response = global.routes.include('lib', 'policy_response.js');
var verifyAuth0JWTController = global.routes.include('controllers', 'authorizers/verifyAuth0JWT.js');

module.exports.verifyjwt = (event, context, callback) => {

    verifyAuth0JWTController.execute(event).then((response) => {

        if(validator.isEmail(response)){

            return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, response));

        }else if(response == verifyAuth0JWTController.messages.bypass){

            return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, null));

        }else{

            return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));

        }

    }).catch(() =>{

        return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));

    });

};
