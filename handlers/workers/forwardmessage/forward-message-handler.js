const LambdaHandler = require('../../lambda-handler');
const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');

module.exports = class ForwardMessageHandler extends LambdaHandler {

	async handleInternal(event, lambdaContext, lambdaCallback, handlerDelegate) {

		try {

			await handlerDelegate();

			new LambdaResponse().issueResponse(200, {}, lambdaCallback);
			return true;

		} catch(error) {

			new LambdaResponse().issueError(error.message, event, lambdaCallback);

		}

	}

}
