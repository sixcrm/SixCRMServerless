const LambdaHandler = require('../lambda-handler');
const LambdaResponse = require('../controllers/providers/lambda-response.js');

module.exports = class EndpointHandler extends LambdaHandler {

	async handleInternal(event, lambdaContext, lambdaCallback, handlerDelegate) {

		try {

			const response = await handlerDelegate(event);

			return new LambdaResponse().issueSuccess(response, lambdaCallback);

		} catch (error) {

			return new LambdaResponse().issueError(error, event, lambdaCallback);

		}

	}

}
