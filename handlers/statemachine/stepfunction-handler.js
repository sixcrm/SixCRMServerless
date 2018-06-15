require('@sixcrm/sixcrmcore');
//const LambdaHandler = global.SixCRM.routes.include('handlers', 'workers/lambda-handler.');
//const LambdaResponse = global.SixCRM.routes.include('controllers', 'providers/lambda-response.js');

module.exports = class StepFunctionHandler {

	async handle(event, lambdaContext, lambdaCallback, handlerDelegate) {

		try{

			let response = await handlerDelegate(event);

			return lambdaCallback(null, response);

		}catch(error){

			return lambdaCallback(error, null);

		}

	}

}
