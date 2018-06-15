
const uuidV4 = require('uuid/v4');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class FulfillmentProviderTest extends IntegrationTest {

	constructor(){

		super();

	}

	executeProductBlockTest(){

		du.info('Execute Product Block Test');

		let fulfillment_provider_id = uuidV4();
		let product_id = uuidV4();

		du.info('Fulfillment Provider ID: '+fulfillment_provider_id);
		du.info('Product ID: '+product_id);

		return this.createFulfillmentProvider(fulfillment_provider_id)
			.then(() => this.createProduct(product_id, fulfillment_provider_id))
			.then(() => this.deleteFulfillmentProvider(fulfillment_provider_id, 403))
			.then(response => {
				return response;
			})
			.then(() => this.deleteProduct(product_id))
			.then(() => this.deleteFulfillmentProvider(fulfillment_provider_id));

	}

	createFulfillmentProvider(fulfillment_provider_id){

		du.info('Create Fulfillment Provider');

		let fulfillmentprovider_create_query = `mutation { createfulfillmentprovider ( fulfillmentprovider: { id: "`+fulfillment_provider_id+`", name: "test", provider: {name: "Hashtag", username:"abc123", password:"abc123", threepl_key:"{`+uuidV4()+`}", threepl_customer_id: 123}}) { id } }`;

		return this.executeQuery(fulfillmentprovider_create_query);

	}

	createProduct(product_id, fulfillment_provider_id){

		du.info('Create Product');

		let product_create_query = `mutation { createproduct (product: { id: "`+product_id+`", name: "Testing Entity Indexing", sku: "abc1234", ship: true, shipping_delay:3600,  fulfillment_provider:"`+fulfillment_provider_id+`", default_price:4.99}) { id } }`;

		return this.executeQuery(product_create_query);

	}

	deleteFulfillmentProvider(id, code){

		du.info('Delete Fulfillment Provider');

		let delete_query = `mutation { deletefulfillmentprovider (id: "`+id+`") { id } }`;

		return this.executeQuery(delete_query, code);

	}

	deleteProduct(id, code){

		du.info('Delete Product');

		let delete_query = `mutation { deleteproduct (id: "`+id+`" ) { id } }`;

		return this.executeQuery(delete_query, code);

	}

}
