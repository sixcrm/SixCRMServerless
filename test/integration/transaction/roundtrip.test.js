var request = require('supertest');
var chai = require('chai');

chai.use(require('chai-json-schema'));
var assert = require('chai').assert
var fs = require('fs');
var yaml = require('js-yaml');

const du = global.routes.include('lib','debug-utilities.js');
const random = global.routes.include('lib','random.js');
const signatureutilities = global.routes.include('lib','signature.js');

try {
    var config = yaml.safeLoad(fs.readFileSync('./test/integration/config/'+global.environment+'.yml', 'utf8'));
} catch (e) {
    du.warning(e);
}

var endpoint = config.endpoint;
var appropriate_spacing = '        ';

describe('Round Trip Test', function() {
    describe('Confirms a sales funnel purchase with partial and multiple upsells.', function() {
        it('Returns a confirmed sale', function (done) {

          	let request_time = new Date().getTime();
          	let secret_key = config.access_keys.super_user.secret_key;
          	let access_key = config.access_keys.super_user.access_key;
          	let account = config.account;
            var campaign_id = '70a6689a-5814-438b-b9fd-dd484d0812f9';

            let signature = signatureutilities.createSignature(secret_key, request_time);
            let authorization_string = access_key+':'+request_time+':'+signature;
            let this_request = request(endpoint);

            du.highlight('Request Time: ', request_time);
            du.highlight('Signature: ', signature);
            du.highlight('Authorization String: ', authorization_string);
            du.output(appropriate_spacing+'Acquiring Token');

            let affiliate_id = random.createRandomString(10);
            let subaffiliate_1_id = random.createRandomString(10);
            let subaffiliate_2_id = random.createRandomString(10);
            let subaffiliate_3_id = random.createRandomString(10);
            let subaffiliate_4_id = random.createRandomString(10);
            let subaffiliate_5_id = random.createRandomString(10);
            let cid = random.createRandomString(10);

            var post_body = {
                "campaign":campaign_id,
                "affiliates":{
                    "affiliate":affiliate_id,
                    "subaffiliate_1":subaffiliate_1_id,
                    "subaffiliate_2":subaffiliate_2_id,
                    "subaffiliate_3":subaffiliate_3_id,
                    "subaffiliate_4":subaffiliate_4_id,
                    "subaffiliate_5":subaffiliate_5_id,
                    "cid":cid
                }
            };

            du.debug('Post data', post_body);

    	this_request.post('token/acquire/'+account)
      .send(post_body)
			.set('Content-Type', 'application/json')
			.set('Authorization', authorization_string)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end(function(err, response){
    du.debug(response.body);
    assert.isObject(response.body);
    assert.property(response.body, "success");
    assert.equal(response.body.success, true);
    assert.isString(response.body.response);

    var jwt = response.body.response;

    du.debug('Acquired JWT:', jwt);

    var post_body = {
        "campaign":campaign_id,
        "affiliates":{
            "affiliate":affiliate_id,
            "subaffiliate_1":subaffiliate_1_id,
            "subaffiliate_2":subaffiliate_2_id,
            "subaffiliate_3":subaffiliate_3_id,
            "subaffiliate_4":subaffiliate_4_id,
            "subaffiliate_5":subaffiliate_5_id
        },
        "customer":{
            "firstname":"Rama",
            "lastname":"Damunaste",
            "email":"rama@damunaste.com",
            "phone":"1234567890",
            "billing":{
                "line1":"10 Downing St.",
                "city":"Detroit",
                "state":"Michigan",
                "zip":"12345",
                "country":"US"
            },
            "address":{
                "line1":"334 Lombard St.",
                "line2":"Apartment 2",
                "city":"Portland",
                "state":"Oregon",
                "zip":"97203",
                "country":"US"
            }
        }
    };

    du.debug('Post data', post_body);

    du.output(appropriate_spacing+'Creating Lead');

    du.debug('lead/create/'+account);

    this_request.post('lead/create/'+account)
					.send(post_body)
					.set('Content-Type', 'application/json')
					.set('Authorization', jwt)
					.expect(200)
					.expect('Content-Type', 'application/json')
					.expect('Access-Control-Allow-Origin','*')
					.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
					.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
					.end(function(err, response){
    du.debug('Create Lead Response', response.body);
    assert.property(response.body, "success");
    assert.equal(response.body.success, true);
    assert.property(response.body, "response");
    assert.property(response.body.response, "id");
    assert.property(response.body.response, "customer");
						//Technical Debt:  Let's dig in here a little further.  This is pretty light testing.

    var session_id = response.body.response.id;
					  	var product_schedules = ["12529a17-ac32-4e46-b05b-83862843055d"]

					  	var order_create = {
      "session":session_id,
      "product_schedules":product_schedules,
      "creditcard":{
          "number":"4111111111111111",
          "expiration":"1025",
          "ccv":"999",
          "name":"Rama Damunaste",
          "address":{
              "line1":"10 Skid Rw.",
              "line2":"Suite 100",
              "city":"Portland",
              "state":"Oregon",
              "zip":"97213",
              "country":"USA"
          }
      }
  };

    du.debug('Order Create JSON', order_create);

					  	du.output(appropriate_spacing+'Creating Order');
					  	this_request.post('order/create/'+account)
							.send(order_create)
							.set('Content-Type', 'application/json')
							.set('Authorization', jwt)
							.expect(200)
							.expect('Content-Type', 'application/json')
							.expect('Access-Control-Allow-Origin','*')
							.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
							.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
							.end(function(err, response){
    du.debug('Create Order Response:', response.body);
    assert.property(response.body, "success");
    assert.equal(response.body.success, true);

    assert.property(response.body, "response");
    assert.property(response.body.response, "processor_response");
    var processor_response = JSON.parse(response.body.response.processor_response);

    assert.isObject(processor_response);
    assert.property(processor_response, "message");
    assert.equal(processor_response.message, "Success");
    assert.property(processor_response, 'results');
    assert.property(processor_response.results, 'response');
    assert.equal(processor_response.results.response, '1');

    var upsell_product_schedules = ['8d1e896f-c50d-4a6b-8c84-d5661c16a046'];

    var upsell_create = {
        "session": session_id,
        "product_schedules": upsell_product_schedules
    };

    du.debug('Upsell Post Data:', upsell_create);

    du.output(appropriate_spacing+'Creating Another Order');

    du.debug('upsell/create/'+account);

    this_request.post('upsell/create/'+account)
									.send(upsell_create)
									.set('Content-Type', 'application/json')
									.set('Authorization', jwt)
									.expect(200)
									.expect('Content-Type', 'application/json')
									.expect('Access-Control-Allow-Origin','*')
									.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
									.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
									.end(function(err, response){
    du.debug('Upsell Result: ', response.body);
    assert.property(response.body, "success");
    assert.equal(response.body.success, true);
    assert.property(response.body, "response");
//										assert.property(response.body.response, "parentsession");
//										assert.isString(response.body.response.parentsession);
    assert.property(response.body.response, "processor_response");

    var processor_response = JSON.parse(response.body.response.processor_response);

    assert.isObject(processor_response);
    assert.property(processor_response, "message");
    assert.equal(processor_response.message, "Success");
    assert.property(processor_response, 'results');
    assert.property(processor_response.results, 'response');
    assert.equal(processor_response.results.response, '1');

    du.output(appropriate_spacing+'Confirming Order');
    du.debug('Confirmation params: ', 'session_id='+session_id);

    this_request.get('order/confirm/'+account)
											.query('session='+session_id)
											.set('Content-Type', 'application/json')
											.set('Authorization', jwt)
											.expect(200)
											.expect('Content-Type', 'application/json')
											.expect('Access-Control-Allow-Origin','*')
											.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
											.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
											.end(function(err, response){

    du.debug('Confirm Order results', response.body);
    assert.property(response.body, "success");
    assert.equal(response.body.success, true);
    assert.property(response.body, "response");
    assert.property(response.body.response, "session");
    assert.property(response.body.response, "customer");
    assert.property(response.body.response, "transactions");
    assert.property(response.body.response, "transaction_products");

												//console.log(response.body.response.transactions);
    assert.equal(response.body.response.transactions.length, 2);
    assert.equal(response.body.response.transaction_products.length, 2);
												//should have 2 transactions
												//should have 2 products

    done();
}, done);

}, done);
}, done);
}, done);
}, done);
        });
    });
});
