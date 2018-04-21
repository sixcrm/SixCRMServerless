const LambdaHandler = require('./lambda-handler');
const policy_response = global.SixCRM.routes.include('lib', 'policy_response.js');

module.exports = class AuthorizationHandler extends LambdaHandler {

	async handleInternal(event, lambdaContext, lambdaCallback, handlerDelegate) {

		try {

			const result = await handlerDelegate(event);

			if (result.allow) {

				return lambdaCallback(null, policy_response.generatePolicy('user', 'Allow', event.methodArn, result.response));

			} else {

				return lambdaCallback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));

			}

		} catch (error) {

		  return lambdaCallback(null, policy_response.generatePolicy('user', 'Deny', event.methodArn, null));

		}

	}

}
