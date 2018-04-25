const LambdaContext = require('./lambda-context');
const ServerlessRuntime = require('../core/ServerlessRuntime');

module.exports = class LambdaHandler
{
	async handle(event, lambdaContext, lambdaCallback, handlerDelegate) {

		ServerlessRuntime.setContext(new LambdaContext(lambdaContext));

		try {

			await this.handleInternal(event, lambdaContext, lambdaCallback, handlerDelegate);

		} finally {

			await ServerlessRuntime.clearContext();

		}

	}

	// eslint-disable-next-line no-unused-vars
	async handleInternal(event, lambdaContext, lambdaCallback, handlerDelegate) {
		// override
	}

}
