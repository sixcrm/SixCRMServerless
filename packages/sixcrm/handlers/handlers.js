const LoggingHandler = require('./logging-handler');

module.exports = {
	logger: handleLogging()
}

function handleLogging() {
	return (event, context, callback) => new LoggingHandler().handle(event, context, callback);
}
