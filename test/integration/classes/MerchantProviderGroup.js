
const uuidV4 = require('uuid/v4');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class MerchantProviderGroupTest extends IntegrationTest {

	constructor(){

		super();

	}

	executeProductScheduleBlockTest(){

		du.info('Execute Product Schedule Block Test');

		let merchantprovidergroup_id = uuidV4();
		let productschedule_id = uuidV4();

		du.info('Merchant Provider Group ID: '+merchantprovidergroup_id);
		du.info('Product Schedule ID: '+productschedule_id);

		return this.createMerchantProviderGroup(merchantprovidergroup_id)
			.then(() => this.createProductSchedule(productschedule_id, merchantprovidergroup_id))
			.then(() => this.deleteMerchantProviderGroup(merchantprovidergroup_id, 403))
			.then(response => {
				return response;
			})
			.then(() => this.deleteProductSchedule(productschedule_id))
			.then(() => this.deleteMerchantProviderGroup(merchantprovidergroup_id));

	}

	createMerchantProviderGroup(merchantprovidergroup_id){

		du.info('Create Merchant Provider Group');

		let merchantprovidergroup_create_query = `mutation { createmerchantprovidergroup ( merchantprovidergroup: {id: "`+merchantprovidergroup_id+`", name: "Simple merchant provider group", merchantproviders: [{id:"6c40761d-8919-4ad6-884d-6a46a776cfb9", distribution:1.0 } ] } ) { id } }`;

		return this.executeQuery(merchantprovidergroup_create_query);

	}

	createProductSchedule(productschedule_id, merchantprovidergroup_id){

		du.info('Create Product Schedule');

		let emailtemplate_create_query = `mutation { createproductschedule ( productschedule: { id: "`+productschedule_id+`", name:"Testing Name", merchantprovidergroup:"`+merchantprovidergroup_id+`", schedule: [{ product:"668ad918-0d09-4116-a6fe-0e7a9eda36f8", start:0, end:30, price:49.00, period:30 }]}) { id } }`;

		return this.executeQuery(emailtemplate_create_query);

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
