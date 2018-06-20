require('@sixcrm/sixcrmcore');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const IngestHandler = require('../ingest-handler');
const fs = require('fs-extra');
const path = require('path');
const BBPromise = require('bluebird');
const uuid = require('uuid');
const CampaignEntity = require('../../../controllers/entities/Campaign');
const ProductEntity = require('../../../controllers/entities/Product');
const CrmImportTrackingEntity = require('../../../controllers/entities/CrmImportTracking');

module.exports = class LimelightIngestHandler extends IngestHandler {

	constructor(crm, client, account, artifactsDirectory) {

		super(crm, client, account, artifactsDirectory);

		this._crmImportTrackingEntity = new CrmImportTrackingEntity();
		this._crmImportTrackingEntity.disableACLs();
		this._productEntity = new ProductEntity();
		this._productEntity.disableACLs();
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

		const products = await fs.readJSON(path.join(this._artifactsDirectory, 'scraped-products.json'));
		await BBPromise.each(products, async (llProduct) => {

			const exists = await this._crmImportTrackingEntity.bySource(this._account, 'limelight', String(llProduct.id), 'product');

			if (exists) {

				du.info('product already imported', {
					id: llProduct.id
				});
				return;

			}

			// todo-tim: what about these comments?
			const entity = {
				id: uuid.v4(),
				name: llProduct.name,
				description: llProduct.desc,
				sku: llProduct.sku,
				ship: llProduct.shippable === true || llProduct.shippable === 1 || llProduct.shippable === '1',
				// shipping_delay: undefined,
				// merchantprovidergroup: undefined,
				// fulfillment_provider: undefined,
				default_price: llProduct.price,
				// dynamic_pricing: undefined,
				// attributes: undefined,
				account: this._account
			};

			if (entity.ship) {

				if (llProduct.weight) {

					entity.attributes = {
						weight: {
							unitofmeasururement: 'pounds',
							units: 16 / llProduct.weight
						}
					}

				}

			}

			const product = await this._productEntity.create({
				entity
			});

			await this._crmImportTrackingEntity.createBySource(this._account, 'limelight', String(llProduct.id), 'product', this._batch, product.id);

		});

	}

	async _ingestCampaigns() {

		du.info('LimelightIngestHandler#_ingestCampaigns');

		const campaigns = await fs.readJSON(path.join(this._artifactsDirectory, 'scraped-campaigns.json'));
		await BBPromise.each(campaigns, async (llCampaign) => {

			const exists = await this._crmImportTrackingEntity.bySource(this._account, 'limelight', String(llCampaign.id), 'campaign');

			if (exists) {

				du.info('campaign already imported', {
					id: llCampaign.id
				});
				return;

			}

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
