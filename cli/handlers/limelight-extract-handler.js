const du = require('../../lib/debug-utilities');
const ExtractHandler = require('./extract-handler');
const LimelightApi = require('@adexchange/aeg-limelight-api').Api;
const fs = require('fs-extra');
const path = require('path');

module.exports = class LimelightExtractHandler extends ExtractHandler {

	constructor(client, user, password, artifactsDirectory) {

		super('limelight', client, user, password, artifactsDirectory);

		this._api = new LimelightApi(user, password, client)
			.on('info', (data) => {

				du.info(data);

			})
			.on('warn', (data) => {

				du.warning(data);

			})
			.on('error', (data) => {

				du.error('server', data);

			});
	}

	async _extract() {

		du.debug('LimelightExtractHandler#_extract()');
		await this._extractCampaigns();

	}

	async _extractCampaigns() {

		const campaigns = await this._api.findActiveCampaignsExpanded();
		await fs.writeJson(path.join(this._artifactsDirectory, 'activeCampaigns.json'), campaigns);

	}

}
