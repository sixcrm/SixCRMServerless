

module.exports.verifysitejwt = (event, context, callback) => {

	require('../../../SixCRM.js');
	const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

	var policy_response = global.SixCRM.routes.include('lib', 'policy_response.js');
	var VerifySiteJWTController = global.SixCRM.routes.include('controllers', 'authorizers/verifySiteJWT.js');
	const verifySiteJWTController = new VerifySiteJWTController();

	verifySiteJWTController.execute(event).then((response) => {

		if(stringutilities.isEmail(response)){

			return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, response));

		}else if(response == verifySiteJWTController.messages.bypass){

			return callback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, null));

		}else{

			return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));

		}

	}).catch(() =>{

		return callback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));

	});

};
