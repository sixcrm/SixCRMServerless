const eu = require('../../lib/error-utilities');
const fs = require('fs-extra');

module.exports = class ExtractHandler {

	constructor(crm, client, user, password, artifactsDirectory) {

		this._crm = crm;
		this._client = client;
		this._user = user;
		this._password = password;
		this._artifactsDirectory = artifactsDirectory;

	}

	async extract() {

		await fs.ensureDir(this._artifactsDirectory);
		return this._extract();

	}

	async _extract() {

		throw eu.getError('server', 'extract not implemented');

	}

}
