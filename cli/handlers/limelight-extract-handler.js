const du = require('../../lib/debug-utilities');
const ExtractHandler = require('./extract-handler');
const LimelightApi = require('@adexchange/aeg-limelight-api').Api;
const fs = require('fs-extra');
const path = require('path');
const BBPromise = require('bluebird');
const _ = require('lodash');
const LimelightScraping = require('../scraping/limelight-scraper');

module.exports = class LimelightExtractHandler extends ExtractHandler {

	constructor(client, apiUser, apiPassword, webUser, webPassword, artifactsDirectory) {

		super('limelight', client, apiUser, apiPassword, artifactsDirectory);

		this._scraper = new LimelightScraping(client, webUser, webPassword, artifactsDirectory);

		this._api = new LimelightApi(apiUser, apiPassword, client)
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

		await this._apiExtract();
		await this._webExtract();

	}

	async _webExtract() {

		const cookie = await this._scraper.signOn();
		await this._scraper.getGateways(cookie);
		await this._scraper.getPaymentRoutes(cookie);
		const campaigns = await fs.readJSON(path.join(this._artifactsDirectory, 'campaigns.json'));
		await this._scraper.getCampaigns(cookie, campaigns.map(c => c.id));
		const products = await fs.readJSON(path.join(this._artifactsDirectory, 'products.json'));
		await this._scraper.getProducts(cookie, products.map(p => p.id));
		await this._scraper.getEmailTemplates(cookie);
		await this._scraper.getSMTPProviders(cookie);

	}

	async _apiExtract() {

		du.debug('LimelightExtractHandler#_extract(): campaigns');

		const campaigns = await this._extractCampaigns();

		du.debug('LimelightExtractHandler#_extract(): gateways');

		const gatewaysIds = await BBPromise.reduce(campaigns, async (memo, campaign) => {

			memo.push(...campaign.gatewayId.split(','));
			return memo;

		}, []);

		const distinctGatewayIds = _.uniq(gatewaysIds);

		await this._extractGateways(distinctGatewayIds);

		du.debug('LimelightExtractHandler#_extract(): products');

		const productIds = await BBPromise.reduce(campaigns, async (memo, campaign) => {

			memo.push(..._.map(campaign.products, 'id'));
			return memo;

		}, []);

		const distinctProductIds = _.uniq(productIds);

		await this._extractProducts(distinctProductIds);

	}

	async _extractCampaigns() {

		const campaigns = await this._api.findActiveCampaignsExpanded();
		await fs.writeJson(path.join(this._artifactsDirectory, 'campaigns.json'), campaigns, {
			spaces: 4
		});
		return campaigns;

	}

	async _extractGateways(gatewayIds) {

		if (gatewayIds.length === 0) {

			return;

		}

		const gateways = await this._api.getGateways(gatewayIds);
		await fs.writeJson(path.join(this._artifactsDirectory, 'gateways.json'), gateways, {
			spaces: 4
		});

	}

	async _extractProducts(productIds) {

		if (productIds.length === 0) {

			return;

		}

		const gateways = await this._api.getProducts(productIds);
		await fs.writeJson(path.join(this._artifactsDirectory, 'products.json'), gateways);

	}

}
