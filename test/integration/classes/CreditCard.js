
const uuidV4 = require('uuid/v4');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class CreditCardTest extends IntegrationTest {

	constructor(){

		super();

	}

	executeCustomerBlockTest(){

		du.info('Execute Customer Block Test');

		let creditcard_id = uuidV4();
		let customer_id = uuidV4();

		du.info('Credit Card ID: '+creditcard_id);
		du.info('Customer ID: '+customer_id);

		return this.createCreditCard(creditcard_id, customer_id)
			.then(() => this.createCustomer(customer_id, creditcard_id))
			.then(() => this.deleteCreditCard(creditcard_id, 403))
			.then(response => {
				return response;
			})
			.then(() => this.deleteCustomer(customer_id))
			.then(() => this.deleteCreditCard(creditcard_id));

	}

	createCreditCard(creditcard_id, customer_id){

		du.info('Create Credit Card');

		let creditcard_create_query = `mutation { createcreditcard (creditcard: { number: "3111111111111111", expiration: "1025", name: "Rama2 Damunaste", address: { line1: "102 Skid Rw.", line2: "Suite 100", city: "Portland", state: "OR", zip: "97213", country: "US" }, id: "`+creditcard_id+`", customers:["`+customer_id+`"] }) { id } }`;

		return this.executeQuery(creditcard_create_query);

	}

	createCustomer(customer_id, creditcard_id){

		du.info('Create Customer');

		let customer_create_query = `mutation { createcustomer ( customer: {id: "`+customer_id+`", email: "test@test.com", firstname: "Test_b5803b28-c584-4bb3-8fac-3315b91686b3", lastname: "Test", phone: "1234567890", address: { line1: "123 Test St.", line2: "Apartment 3", city: "Portland", state: "OR", zip: "97213", country: "US" }, creditcards:["`+creditcard_id+`"]} ) { id } }`;

		return this.executeQuery(customer_create_query);

	}

	deleteCreditCard(id, code){

		du.info('Delete Credit Card');

		let creditcard_delete_query = 'mutation { deletecreditcard (id: "'+id+'") { id } }';

		return this.executeQuery(creditcard_delete_query, code);

	}

	deleteCustomer(id, code){

		du.info('Delete Customer');

		let customer_delete_query = 'mutation { deletecustomer (id: "'+id+'") { id } }';

		return this.executeQuery(customer_delete_query, code);

	}

}
