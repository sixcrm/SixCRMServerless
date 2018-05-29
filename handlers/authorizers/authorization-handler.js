const LambdaHandler = require('../lambda-handler');
const policy_response = global.SixCRM.routes.include('lib', 'policy_response.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

module.exports = class AuthorizationHandler extends LambdaHandler {

	async handleInternal(event, lambdaContext, lambdaCallback, handlerDelegate, handlerFieldName = 'user') {

		try {

			const result = await handlerDelegate(event);

			if (result.allow) {

				return lambdaCallback(null, policy_response.generatePolicy(handlerFieldName, 'Allow', event.methodArn, result.response));

			} else {

				return lambdaCallback(null, policy_response.generatePolicy(handlerFieldName, 'Deny', event.methodArn, null));

			}

		} catch (error) {

			du.error('server', error);

			throw eu.getError('server', 'Authorization handler exception');

		}

	}

}
