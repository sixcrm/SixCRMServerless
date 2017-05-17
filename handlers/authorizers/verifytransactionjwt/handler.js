'use strict';
const _ = require('underscore');

require('../../../routes.js');

var policy_response = global.routes.include('lib', 'policy_response.js');
var verifyTransactionJWTController = global.routes.include('controllers', 'authorizers/verifyTransactionJWT.js');

module.exports.verifyjwt = (event, context, callback) => {

    verifyTransactionJWTController.execute(event).then((response) => {

        if(_.isString(response)){

            return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, response));

        }else{

            return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));

        }

    }).catch(() =>{

        return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));

    });

};
