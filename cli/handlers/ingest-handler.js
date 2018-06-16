const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

module.exports = class IngestHandler {

	constructor(account, extractDirectory) {

		this._account = account;
		this._extractDirectory = extractDirectory;

	}

	async ingest() {

		du.debug('IngestHandler#ingest()');

	}

}
