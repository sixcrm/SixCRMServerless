const LambdaHandler = require('../lambda-handler');
const policy_response = require('@sixcrm/sixcrmcore/util/policy_response').default;
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;

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
