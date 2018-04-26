const ReindexHandler = require('./reindex-handler');

module.exports = {
	reindex: handleReindex(),
}

function handleReindex() {
	return (event, context, callback) => new ReindexHandler().handle(event, context, callback);
}
