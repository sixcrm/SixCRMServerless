const LambdaHandler = require('./lambda-handler');
const LoggerController = require('../controllers/workers/logger');

module.exports = class LoggingHandler extends LambdaHandler {

	async handleInternal(event, lambdaContext, lambdaCallback) {

		try {

			await new LoggerController().processLog(event);
			return lambdaCallback(null, 'Success');

		} catch(error) {

			return lambdaCallback(JSON.stringify(error));

		}

	}

}
