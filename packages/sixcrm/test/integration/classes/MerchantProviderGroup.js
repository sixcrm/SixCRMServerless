
const uuidV4 = require('uuid/v4');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class MerchantProviderGroupTest extends IntegrationTest {

	constructor(){

		super();

	}

	async executeProductScheduleBlockTest(){

		du.info('Execute Product Schedule Block Test');

		const merchantprovidergroup_id = uuidV4();

		du.info('Merchant Provider Group ID: '+merchantprovidergroup_id);

		await this.createMerchantProviderGroup(merchantprovidergroup_id);
		const { id: productschedule_id } = (await this.createProductSchedule(merchantprovidergroup_id)).body.response.data.createproductschedule;

		du.info(`Product Schedule ID: ${productschedule_id}`);

		await this.deleteMerchantProviderGroup(merchantprovidergroup_id, 403);
		await this.deleteProductSchedule(productschedule_id);
		return this.deleteMerchantProviderGroup(merchantprovidergroup_id);

	}

	createMerchantProviderGroup(merchantprovidergroup_id){

		du.info('Create Merchant Provider Group');

		let merchantprovidergroup_create_query = `mutation { createmerchantprovidergroup ( merchantprovidergroup: {id: "`+merchantprovidergroup_id+`", name: "Simple merchant provider group", merchantproviders: [{id:"6c40761d-8919-4ad6-884d-6a46a776cfb9", distribution:1.0 } ] } ) { id } }`;

		return this.executeQuery(merchantprovidergroup_create_query);

	}

	createProductSchedule(merchantprovidergroup_id) {

		du.info('Create Product Schedule');

		const productschedule_create_query = `mutation { createproductschedule ( productschedule: { name:"Testing Name", merchantprovidergroup:"${merchantprovidergroup_id}", cycles: [{cycle_products:[{product: "668ad918-0d09-4116-a6fe-0e7a9eda36f8", is_shipping:true,position:1,quantity:1}],length: "30 days",position:1, next_position:1, price:49.00,shipping_price:30}]}) { id } }`;

		return this.executeQuery(productschedule_create_query);

	}

	deleteMerchantProviderGroup(id, code){

		du.info('Delete Merchant Provider Group');

		let delete_query = `mutation { deletemerchantprovidergroup (id: "`+id+`") { id } }`;

		return this.executeQuery(delete_query, code);

	}

	deleteProductSchedule(id, code){

		du.info('Delete Product Schedule');

		let delete_query = `mutation { deleteproductschedule (id: "`+id+`" ) { id } }`;

		return this.executeQuery(delete_query, code);

	}

}
