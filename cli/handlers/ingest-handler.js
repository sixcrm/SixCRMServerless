const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;

module.exports = class IngestHandler {

	constructor(crm, client, artifactsDirectory) {

		this._crm = crm;
		this._client = client;
		this._artifactsDirectory = artifactsDirectory;

	}

	async ingest() {

		return this._ingest();

	}

	async _ingest() {

		throw eu.getError('server', '_ingest not implemented');

	}

}
