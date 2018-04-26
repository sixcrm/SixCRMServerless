const LambdaHandler = require('../../lambda-handler');
const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');
const ReIndexingHelperController = global.SixCRM.routes.include('helpers', 'indexing/ReIndexing.js');

module.exports = class ReindexHandler extends LambdaHandler {

	async handleInternal(event, lambdaContext, lambdaCallback) {

		try {

			const result = await new ReIndexingHelperController().execute(true);

			return new LambdaResponse().issueResponse(200, { message: result }, lambdaCallback);

		} catch(error) {

			return new LambdaResponse().issueError(error.message, event, lambdaCallback);

		}

	}

}
