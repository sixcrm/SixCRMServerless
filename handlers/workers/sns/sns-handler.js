const LambdaHandler = require('../../lambda-handler');
const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');

module.exports = class SnsHandler extends LambdaHandler {

	async handleInternal(event, lambdaContext, lambdaCallback, handlerDelegate) {

		try {

			const result = await handlerDelegate(event);

			return new LambdaResponse().issueResponse(200, { message: result }, lambdaCallback);

		} catch(error) {

			return new LambdaResponse().issueError(error.message, event, lambdaCallback);

		}

	}

}
