
const uuidV4 = require('uuid/v4');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class MerchantProviderTest extends IntegrationTest {

	constructor(){

		super();

	}

	executeMerchantProviderGroupBlockTest(){

		du.info('Execute Merchant Provider Group Block Test');

		let merchantprovider_id = uuidV4();
		let merchantprovidergroup_id = uuidV4();

		du.info('Merchant Provider ID: '+merchantprovider_id);
		du.info('Merchant Provider Group ID: '+merchantprovidergroup_id);

		return this.createMerchantProvider(merchantprovider_id)
			.then(() => this.createMerchantProviderGroup(merchantprovidergroup_id, merchantprovider_id))
			.then(() => this.deleteMerchantProvider(merchantprovider_id, 403))
			.then(response => {
				return response;
			})
			.then(() => this.deleteMerchantProviderGroup(merchantprovidergroup_id))
			.then(() => this.deleteMerchantProvider(merchantprovider_id));

	}

	executeTransactionBlockTest(){

		du.info('Execute Transaction Block Test');

		let merchantprovider_id = uuidV4();
		let transaction_id = uuidV4();

		du.info('Merchant Provider ID: '+merchantprovider_id);
		du.info('Transaction ID: '+transaction_id);

		return this.createMerchantProvider(merchantprovider_id)
			.then(() => this.createTransaction(transaction_id, merchantprovider_id))
			.then(() => this.deleteMerchantProvider(merchantprovider_id, 403))
			.then(response => {
				return response;
			})
			.then(() => this.deleteTransaction(transaction_id))
			.then(() => this.deleteMerchantProvider(merchantprovider_id));
	}

	createMerchantProvider(merchantprovider_id){

		du.info('Create Merchant Provider');

		let merchantprovider_create_query = `mutation { createmerchantprovider ( merchantprovider:{ id:"`+merchantprovider_id+`", name:"test", enabled:true, allow_prepaid:true, accepted_payment_methods:["Visa","Mastercard"], processing:{ monthly_cap: 55000, discount_rate: 0.1, transaction_fee: 0.06, reserve_rate: 0.5, maximum_chargeback_ratio: 0.33, transaction_counts: { daily:15, weekly:45, monthly:180 } }, processor:{ name:"NMA" }, gateway:{ name:"NMI", type:"NMI", username:"test", password:"test", processor_id:"123" }, customer_service:{ email:"customerservice@dot.com", url:"http://dot.com/whatever", description:"Dot com", phone:"0000000000", } } ) { id } }`;

		return this.executeQuery(merchantprovider_create_query);

	}

	createMerchantProviderGroup(merchantprovidergroup_id, merchantprovider_id){

		du.info('Create Merchant Provider Group');

		let merchantprovidergroup_create_query = `mutation { createmerchantprovidergroup ( merchantprovidergroup: {id: "`+merchantprovidergroup_id+`", name: "Simple merchant provider group", merchantproviders: [{id:"`+merchantprovider_id+`", distribution:1.0 } ] } ) { id } }`;

		return this.executeQuery(merchantprovidergroup_create_query);

	}

	createTransaction(transaction_id, merchantprovider_id){

		du.info('Create Transaction');

		let merchantprovidergroup_create_query = `mutation { createtransaction ( transaction: { id: "`+transaction_id+`", rebill: "55c103b4-670a-439e-98d4-5a2834bb5fc3", amount:30000.00, processor_response:"Test", merchant_provider: "`+merchantprovider_id+`", products: [{amount:"4.99", product: "616cc994-9480-4640-b26c-03810a679fe3"}]} ) { id } }`;

		return this.executeQuery(merchantprovidergroup_create_query);

	}

	deleteMerchantProvider(id, code){

		du.info('Delete Merchant Provider');

		let delete_query = `mutation { deletemerchantprovider (id: "`+id+`") { id } }`;

		return this.executeQuery(delete_query, code);

	}

	deleteMerchantProviderGroup(id, code){

		du.info('Delete Merchant Provider Group');

		let delete_query = `mutation { deletemerchantprovidergroup (id: "`+id+`" ) { id } }`;

		return this.executeQuery(delete_query, code);

	}

	deleteTransaction(id, code){

		du.info('Delete Transaction');

		let delete_query = `mutation { deletetransaction (id: "`+id+`" ) { id } }`;

		return this.executeQuery(delete_query, code);

	}

}
