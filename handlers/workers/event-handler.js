require('../../SixCRM.js');
const LambdaHandler = require('../lambda-handler');
const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');

module.exports = class EventHandler extends LambdaHandler{

	async handle(event, lambdaContext, lambdaCallback, handlerDelegate) {

		try{

			let response = await handlerDelegate(event);

			return new LambdaResponse().issueResponse(200, { message: response }, lambdaCallback);

		}catch(error){

			return new LambdaResponse().issueError(error.message, event, lambdaCallback);

		}

	}

}
