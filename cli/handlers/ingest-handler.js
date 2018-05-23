const du = require('../../lib/debug-utilities');

module.exports = class IngestHandler {

	constructor(account, extractDirectory) {

		this._account = account;
		this._extractDirectory = extractDirectory;

	}

	async ingest() {

		du.debug('IngestHandler#ingest()');

	}

}
