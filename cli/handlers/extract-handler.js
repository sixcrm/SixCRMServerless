const eu = require('../../lib/error-utilities');

module.exports = class ExtractHandler {

	constructor(crm, client, user, password) {

		this._crm = crm;
		this._client = client;
		this._user = user;
		this._password = password;

	}

	async extract() {

		return this._extract();

	}

	async _extract() {

		throw eu.getError('server', 'extract not implemented');

	}

}
