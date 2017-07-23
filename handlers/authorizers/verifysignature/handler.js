'use strict';

const _ = require("underscore");

require('../../../SixCRM.js');

var policy_response = global.SixCRM.routes.include('lib', 'policy_response.js');
var verifySignatureController = global.SixCRM.routes.include('controllers', 'authorizers/verifySignature.js');

/*
* Note:  The Authority User referenced in this script is the Six user that has placed the signature on a eCommerce website.  Thus, this method returns the user on whose authority the endpoint is being operated.
*/

module.exports.verifysignature = (event, context, callback) => {


    verifySignatureController.execute(event).then((authority_user) => {

        if(_.isObject(authority_user) && _.has(authority_user, 'id')){
            return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, authority_user.id));
        }else{
            return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));
        }

    }).catch(() =>{

        return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));

    });

};
