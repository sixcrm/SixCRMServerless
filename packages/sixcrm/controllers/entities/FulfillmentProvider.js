const { getProductSetupService, LegacyProduct } = require('@6crm/sixcrm-product-setup');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class FulfillmentProviderController extends entityController {

	constructor(){
		super('fulfillmentprovider');

		this.encrypted_attribute_paths = [
			'provider.username',
			'provider.password',
			'provider.api_key',
			'provider.api_secret'
		];
	}

	async associatedEntitiesCheck({id}){
		const products = (await getProductSetupService().findProducts({
			fulfillment_provider_id: id
		})).map(product => LegacyProduct.hybridFromProduct(product));

		return products.map(product =>
			this.createAssociatedEntitiesObject({
				name:'Product',
				object: product
			})
		);
	}

	async update({entity}) {
		await this.handleCensoredValues(entity);

		return super.update({entity, ignore_updated_at: true});
	}


}
