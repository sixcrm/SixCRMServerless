const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

module.exports = class IngestHandler {

	constructor(crm, client, account, artifactsDirectory, batch) {

		this._crm = crm;
		this._client = client;
		this._account = account;
		this._artifactsDirectory = artifactsDirectory;
		this._batch = batch;

	}

	async ingest() {

		await this._ingest();

		du.info('IngestHandler#ingest(): done');

	}

	async _ingest() {

		throw eu.getError('server', '_ingest not implemented');

	}

}
