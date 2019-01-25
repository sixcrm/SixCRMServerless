
const _ = require('lodash');
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;

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

	associatedEntitiesCheck({id}){
		let return_array = [];

		let data_acquisition_promises = [
			this.executeAssociatedEntityFunction('ProductController', 'listByFulfillmentProvider', {fulfillment_provider:id})
		];

		return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

			let products = data_acquisition_promises[0];

			if(_.has(products, 'products') && arrayutilities.nonEmpty(products.products)){
				arrayutilities.map(products.products, (product) => {
					return_array.push(this.createAssociatedEntitiesObject({name:'Product', object: product}));
				});
			}

			return return_array;

		});

	}

	async update({entity}) {
		await this.handleCensoredValues(entity);

		return super.update({entity, ignore_updated_at: true});
	}


}

