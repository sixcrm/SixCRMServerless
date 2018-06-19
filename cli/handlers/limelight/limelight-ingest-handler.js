require('@sixcrm/sixcrmcore');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const IngestHandler = require('../ingest-handler');
const fs = require('fs-extra');
const path = require('path');
const BBPromise = require('bluebird');
const uuid = require('uuid');
const CampaignEntity = require('../../../controllers/entities/Campaign');
const CrmImportTrackingEntity = require('../../../controllers/entities/CrmImportTracking');

module.exports = class LimelightIngestHandler extends IngestHandler {

	constructor(crm, client, account, artifactsDirectory) {

		super(crm, client, account, artifactsDirectory);

		this._crmImportTrackingEntity = new CrmImportTrackingEntity();
		this._crmImportTrackingEntity.disableACLs();
		this._campaignEntity = new CampaignEntity();
		this._campaignEntity.disableACLs();

	}

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

		const campaigns = await fs.readJSON(path.join(this._artifactsDirectory, 'scraped-campaigns.json'));
		await BBPromise.each(campaigns, async (llCampaign) => {

			const campaign = await this._campaignEntity.create({
				entity: {
					id: uuid.v4(),
					account: this._account,
					name: llCampaign.name,
					description: llCampaign.desc,
					allow_on_order_form: true, // todo-tim: is this right?
					show_prepaid: true, // todo-tim: is this right?
					allow_prepaid: true, // todo-tim: is this right?
					// emailtemplates
				}
			});

			await this._crmImportTrackingEntity.createBySource(this._account, 'limelight', String(llCampaign.id), 'campaign', this._batch, campaign.id);

		});

	}

	async _ingestMerchantProviders() {

		du.info('LimelightIngestHandler#_ingestMerchantProviders');

	}

	async _ingestMerchantProviderGroups() {

		du.info('LimelightIngestHandler#_ingestMerchantProviderGroups');

	}

}
