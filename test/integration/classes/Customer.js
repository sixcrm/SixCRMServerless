
const uuidV4 = require('uuid/v4');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class CustomerTest extends IntegrationTest {

	constructor(){

		super();

	}

	executeCustomerNoteBlockTest(){

		du.info('Execute Customer Note Block Test');

		let customer_id = uuidV4();
		let customernote_id = uuidV4();

		du.info('Customer ID: '+customer_id);
		du.info('Customer Note ID: '+customernote_id);

		return this.createCustomer(customer_id)
			.then(() => this.createCustomerNote(customernote_id, customer_id))
			.then(() => this.deleteCustomer(customer_id, 403))
			.then(response => {
				return response;
			})
			.then(() => this.deleteCustomerNote(customernote_id))
			.then(() => this.deleteCustomer(customer_id));

	}

	executeSessionBlockTest(){

		du.info('Execute Session Block Test');

		let customer_id = uuidV4();
		let session_id = uuidV4();

		du.info('Customer ID: '+customer_id);
		du.info('Session ID: '+session_id);

		return this.createCustomer(customer_id)
			.then(() => this.createSession(session_id, customer_id))
			.then(() => this.deleteCustomer(customer_id, 403))
			.then(response => {
				return response;
			})
			.then(() => this.deleteSession(session_id))
			.then(() => this.deleteCustomer(customer_id));

	}

	createCustomer(customer_id){

		du.info('Create Customer');

		let customer_create_query = `mutation { createcustomer ( customer: {id: "`+customer_id+`", email: "test@test.com", firstname: "Test_b5803b28-c584-4bb3-8fac-3315b91686b3", lastname: "Test", phone: "1234567890", address: { line1: "123 Test St.", line2: "Apartment 3", city: "Portland", state: "OR", zip: "97213", country: "US" }, creditcards:[] } ) { id } }`;

		return this.executeQuery(customer_create_query);

	}

	createCustomerNote(customernote_id, customer_id){

		du.info('Create Customer Note');

		let customernote_create_query = `mutation { createcustomernote ( customernote: {id: "`+customernote_id+`", customer: "`+customer_id+`", user: "super.user@test.com", body: "This is a really fun test of a really fun create query that is so much fun!"} ) { id } }`;

		return this.executeQuery(customernote_create_query);

	}

	createSession(session_id, customer_id){

		du.info('Create Session');

		let session_create_query = `mutation { createsession ( session: { id: "`+session_id+`", customer: "`+customer_id+`", campaign:"70a6689a-5814-438b-b9fd-dd484d0812f9", product_schedules:["12529a17-ac32-4e46-b05b-83862843055d"], completed: false } ) { id } }`;

		return this.executeQuery(session_create_query);

	}

	deleteCustomer(id, code){

		du.info('Delete Customer');

		let customer_delete_query = `mutation { deletecustomer ( id: "`+id+`" ) { id } }`;

		return this.executeQuery(customer_delete_query, code);

	}

	deleteCustomerNote(id, code){

		du.info('Delete Customer Note');

		let customernote_delete_query = `mutation { deletecustomernote (id: "`+id+`" ) { id } }`;

		return this.executeQuery(customernote_delete_query, code);

	}

	deleteSession(id, code){

		du.info('Delete Session');

		let session_delete_query = 'mutation { deletesession (id: "'+id+'") { id } }';

		return this.executeQuery(session_delete_query, code);

	}

}
