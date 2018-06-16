const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment-timezone');

module.exports = class ExtractHandler {

	constructor(crm, client, user, password, artifactsDirectory) {

		this._crm = crm;
		this._client = client;
		this._user = user;
		this._password = password;
		this._artifactsDirectory = path.join(artifactsDirectory, moment().toISOString().replace(/:/g, '-'));

	}

	async extract() {

		await fs.ensureDir(this._artifactsDirectory);
		return this._extract();

	}

	async _extract() {

		throw eu.getError('server', 'extract not implemented');

	}

}
