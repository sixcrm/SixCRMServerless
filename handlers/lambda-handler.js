require('../SixCRM');
const du = require('../lib/debug-utilities');

const LambdaContext = require('./lambda-context');
const ServerlessRuntime = require('../core/ServerlessRuntime');

module.exports = class LambdaHandler
{
	async handle(event, lambdaContext, lambdaCallback, handlerDelegate, handlerFieldName = 'user') {

		if (event.source === 'serverless-plugin-warmup') {

			du.info('Lambda kept warm', event);
			return lambdaCallback(null, 'Lambda kept warm');

		}

		ServerlessRuntime.setContext(new LambdaContext(lambdaContext));

		try {

			await this.handleInternal(event, lambdaContext, lambdaCallback, handlerDelegate, handlerFieldName);

		}
		catch (error) {

			du.fatal("Unhandled error in lambda", error);

		}
		finally {

			await ServerlessRuntime.clearContext();

		}

	}

	// eslint-disable-next-line no-unused-vars
	async handleInternal(event, lambdaContext, lambdaCallback, handlerDelegate, handlerFieldName) {
		// override
	}

}
