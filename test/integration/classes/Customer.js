'use strict'
const uuidV4 = require('uuid/v4');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class CustomerTest extends IntegrationTest {

  constructor(){

    super();

  }

  executeCustomerNoteBlockTest(){

    du.output('Execute Customer Block Test');

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

  createCustomer(customer_id){

    du.output('Create Customer');

    let customer_create_query = `mutation { createcustomer ( customer: {id: "`+customer_id+`", email: "test@test.com", firstname: "Test_b5803b28-c584-4bb3-8fac-3315b91686b3", lastname: "Test", phone: "1234567890", address: { line1: "123 Test St.", line2: "Apartment 3", city: "Portland", state: "Oregon", zip: "97213", country: "USA" }, creditcards:[] } ) { id } }`;

    return this.executeQuery(customer_create_query);

  }

  createCustomerNote(customernote_id, customer_id){

    du.output('Create Customer Note');

    let customernote_create_query = `mutation { createcustomernote ( customernote: {id: "`+customernote_id+`", customer: "`+customer_id+`", user: "super.user@test.com", body: "This is a really fun test of a really fun create query that is so much fun!"} ) { id } }`;

    return this.executeQuery(customernote_create_query);

  }

  deleteCustomer(id, code){

    du.output('Delete Customer');

    let customer_delete_query = `mutation { deletecustomer ( id: "`+id+`" ) { id } }`;

    return this.executeQuery(customer_delete_query, code);

  }

  deleteCustomerNote(id, code){

    du.output('Delete Customer Note');

    let customernote_delete_query = `mutation { deletecustomernote (id: "`+id+`" ) { id } }`;

    return this.executeQuery(customernote_delete_query, code);

  }

}
