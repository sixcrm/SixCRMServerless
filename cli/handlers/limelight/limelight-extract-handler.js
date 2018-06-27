const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const ExtractHandler = require('../extract-handler');
const LimelightApi = require('@adexchange/aeg-limelight-api').Api;
const fs = require('fs-extra');
const path = require('path');
const BBPromise = require('bluebird');
const _ = require('lodash');
const LimelightScraping = require('./scraping/limelight-scraper');

module.exports = class LimelightExtractHandler extends ExtractHandler {

	constructor(client, apiUser, apiPassword, webUser, webPassword, artifactsDirectory) {

		super('limelight', client, apiUser, apiPassword, artifactsDirectory);

		this._scraper = new LimelightScraping(client, webUser, webPassword, this._artifactsDirectory);

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

		du.info('LimelightExtractHandler#_webExtract()');

		const cookie = await this._scraper.signOn();
		await this._scraper.getGateways(cookie);
		await this._scraper.getPaymentRoutes(cookie);
		const campaigns = await fs.readJSON(path.join(this._artifactsDirectory, 'campaigns.json'));
		await this._scraper.getCampaigns(cookie, campaigns.map(c => c.id));
		const products = await fs.readJSON(path.join(this._artifactsDirectory, 'products.json'));
		await this._scraper.getProducts(cookie, products.map(p => p.id));
		await this._scraper.getEmailTemplates(cookie);
		await this._scraper.getSMTPProviders(cookie);
		await this._scraper.getFulfillmentProviders(cookie);

	}

	async _apiExtract() {

		du.info('LimelightExtractHandler#_apiExtract()');

		const campaigns = await this._extractApiCampaigns();

		const gatewaysIds = await BBPromise.reduce(campaigns, async (memo, campaign) => {

			memo.push(...campaign.gatewayId.split(','));
			return memo;

		}, []);

		const distinctGatewayIds = _.uniq(gatewaysIds);

		await this._extractApiGateways(distinctGatewayIds);

		const productIds = await BBPromise.reduce(campaigns, async (memo, campaign) => {

			memo.push(..._.map(campaign.products, 'id'));
			return memo;

		}, []);

		const distinctProductIds = _.uniq(productIds);

		await this._extractApiProducts(distinctProductIds);

	}

	async _extractApiCampaigns() {

		du.info('LimelightExtractHandler#_extractApiCampaigns()');

		const campaigns = await this._api.findActiveCampaignsExpanded();
		await fs.writeJson(path.join(this._artifactsDirectory, 'campaigns.json'), campaigns, {
			spaces: 4
		});
		return campaigns;

	}

	async _extractApiGateways(gatewayIds) {

		du.info('LimelightExtractHandler#_extractApiGateways()');

		if (gatewayIds.length === 0) {

			return;

		}

		const gateways = await this._api.getGateways(gatewayIds);
		await fs.writeJson(path.join(this._artifactsDirectory, 'gateways.json'), gateways, {
			spaces: 4
		});

	}

	async _extractApiProducts(productIds) {

		du.info('LimelightExtractHandler#_extractApiProducts()');

		if (productIds.length === 0) {

			return;

		}

		const products = await this._api.getProducts(productIds);
		await fs.writeJson(path.join(this._artifactsDirectory, 'products.json'), products, {
			spaces: 4
		});

	}

}
