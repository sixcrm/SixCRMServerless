const du = require('../../lib/debug-utilities');
const ExtractHandler = require('./extract-handler');
const LimelightApi = require('@adexchange/aeg-limelight-api').Api;
const fs = require('fs-extra');
const path = require('path');
const BBPromise = require('bluebird');
const _ = require('lodash');

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
		const campaigns = await this._extractCampaigns();
		const gatewaysIds = await BBPromise.reduce(campaigns, async (memo, campaign) => {

			memo.push(...campaign.gatewayId.split(','));
			return memo;

		}, []);

		const distinctGatewayIds = _.uniq(gatewaysIds);

		await this._extractGateways(distinctGatewayIds);

	}

	async _extractCampaigns() {

		const campaigns = await this._api.findActiveCampaignsExpanded();
		await fs.writeJson(path.join(this._artifactsDirectory, 'campaigns.json'), campaigns);
		return campaigns;

	}

	async _extractGateways(gatewayIds) {

		if (gatewayIds.length === 0) {

			return;

		}

		const gateways = await this._api.getGateways(gatewayIds);
		await fs.writeJson(path.join(this._artifactsDirectory, 'gateways.json'), gateways);

	}

}
