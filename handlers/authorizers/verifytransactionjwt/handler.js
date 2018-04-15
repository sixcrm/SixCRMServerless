
const _ = require('lodash');

module.exports.verifytransactionjwt = (event, context, callback) => {

	require('../../../SixCRM.js');

	var policy_response = global.SixCRM.routes.include('lib', 'policy_response.js');
	var VerifyTransactionJWTController = global.SixCRM.routes.include('controllers', 'authorizers/verifyTransactionJWT.js');
	const verifyTransactionJWTController = new VerifyTransactionJWTController();

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
