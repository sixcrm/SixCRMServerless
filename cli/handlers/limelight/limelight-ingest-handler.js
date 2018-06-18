const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const IngestHandler = require('../ingest-handler');

module.exports = class LimelightIngestHandler extends IngestHandler {

	async _ingest() {

		await this._ingestProducts();
		await this._ingestCampaigns();
		await this._ingestMerchantProviders();
		await this._ingestMerchantProviderGroups();

	}

	async _ingestProducts() {

		du.info('LimelightIngestHandler#_ingestProducts');

	}

	async _ingestCampaigns() {

		du.info('LimelightIngestHandler#_ingestCampaigns');

	}

	async _ingestMerchantProviders() {

		du.info('LimelightIngestHandler#_ingestMerchantProviders');

	}

	async _ingestMerchantProviderGroups() {

		du.info('LimelightIngestHandler#_ingestMerchantProviderGroups');

	}

}
