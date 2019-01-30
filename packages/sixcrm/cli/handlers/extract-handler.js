const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
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
		await fs.writeJson(path.join(this._artifactsDirectory, 'manifest.json'), { crm: this._crm, client: this._client });
		await this._extract();

		du.info('ExtractHandler#extract(): done');

	}

	async _extract() {

		throw eu.getError('server', '_extract not implemented');

	}

}
