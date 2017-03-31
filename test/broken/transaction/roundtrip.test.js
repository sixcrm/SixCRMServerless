var request = require('supertest');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert
var fs = require('fs');
var yaml = require('js-yaml');
var crypto = require('crypto');
const du = require('../../../lib/debug-utilities.js');

try {
  var config = yaml.safeLoad(fs.readFileSync('./test/integration/config/'+environment+'.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

var endpoint = config.endpoint;

var appropriate_spacing = '        ';
describe('Round Trip Test', function() {
  describe('Confirms a sales funnel purchase with partial and multiple upsells.', function() {
    it('Return a confirmed sale', function (done) {
    	
    	var request_time = new Date().getTime();
		var signature = crypto.createHash('sha1').update(config.secret_key+request_time).digest('hex');
    	var authorization_string = config.access_key+':'+request_time+':'+signature;
		
		du.highlight('Request Time: ', request_time);
		du.highlight('Signature: ', signature);
		du.highlight('Authorization String: ', authorization_string);
		
		var this_request = request(endpoint);
		
		du.output(appropriate_spacing+'Acquiring Token');
		
    	this_request.get('token/acquire/')
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
				assert.property(response.body, "message");
				assert.equal(response.body.message, "Success");
				assert.property(response.body, "token");
				assert.isString(response.body.token);
				
				var jwt = response.body.token;		
				
				du.debug('Acquired JWT:', jwt);
				
				var post_body = {
					"campaign_id":"70a6689a-5814-438b-b9fd-dd484d0812f9",
					"affiliate_id":"6b6331f6-7f84-437a-9ac6-093ba301e455",
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
				};
				
				du.debug('Post data', post_body);
				
				du.output(appropriate_spacing+'Creating Lead');
				this_request.post('lead/create/')
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
						assert.property(response.body, "message");
						assert.equal(response.body.message, "Success");
						assert.property(response.body, "results");
						assert.property(response.body.results, "id");
						assert.property(response.body.results, "customer");
						//Technical Debt:  Let's dig in here a little further.  This is pretty light testing.
						
						var session_id = response.body.results.id;
						var campaign_id = response.body.results.campaign;
					  	var product_schedules = ["12529a17-ac32-4e46-b05b-83862843055d"]
					  	
					  	var order_create = {
							"session_id":session_id,
							"product_schedules":product_schedules,
							"campaign_id":campaign_id,
							"type":"sale",
							"ccnumber":"4111111111111111",
							"ccexpiration":"1025",
							"ccccv":"999",
							"name":"Rama Damunaste",
							"address":{
								"line1":"10 Skid Rw.",
								"line2":"Suite 100",
								"city":"Portland",
								"state":"Oregon",
								"zip":"97213",
								"country":"USA"
							}
						};
						
						du.debug('Order Create JSON', order_create);
					  	
					  	du.output(appropriate_spacing+'Creating Order');
					  	this_request.post('order/create/')
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
								assert.property(response.body, "message");
								assert.equal(response.body.message, "Success");
								assert.property(response.body, "results");							
								assert.property(response.body.results, "processor_response");
								try{
									var processor_response = JSON.parse(response.body.results.processor_response);
								}catch(e){
								
								}
								assert.isObject(processor_response);
								assert.property(processor_response, "message");
								assert.equal(processor_response.message, "Success");
								assert.property(processor_response, 'results');
								assert.property(processor_response.results, 'response');
								assert.equal(processor_response.results.response, '1');
								
								var upsell_product_schedules = ["8d1e896f-c50d-4a6b-8c84-d5661c16a046"];
								
								var upsell_create = {
									"session_id":session_id,
									"campaign_id":campaign_id,
									"product_schedules":upsell_product_schedules,
									"type":"sale",
									"ccnumber":"4111111111111111",
									"ccexpiration":"1025",
									"ccccv":"999",
									"name":"Rama Damunaste",
									"address":{
										"line1":"10 Skid Rw.",
										"line2":"Suite 100",
										"city":"Portland",
										"state":"Oregon",
										"zip":"97213",
										"country":"USA"
									}
								};
								
								du.debug('Upsell Post Data:', upsell_create);
								
								du.output(appropriate_spacing+'Creating Another Order');
								
								this_request.post('order/create/')
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
										assert.property(response.body, "message");
										assert.equal(response.body.message, "Success");
										assert.property(response.body, "results");
//										assert.property(response.body.results, "parentsession");
//										assert.isString(response.body.results.parentsession);
										assert.property(response.body.results, "processor_response");
										try{
											var processor_response = JSON.parse(response.body.results.processor_response);
										}catch(e){
								
										}
										assert.isObject(processor_response);
										assert.property(processor_response, "message");
										assert.equal(processor_response.message, "Success");
										assert.property(processor_response, 'results');
										assert.property(processor_response.results, 'response');
										assert.equal(processor_response.results.response, '1');
										
										du.output(appropriate_spacing+'Confirming Order');
										du.debug('Confirmation params: ', 'session_id='+session_id);
										
										this_request.get('order/confirm/')
											.query('session_id='+session_id)
											.set('Content-Type', 'application/json')
											.set('Authorization', jwt)
											.expect(200)
											.expect('Content-Type', 'application/json')
											.expect('Access-Control-Allow-Origin','*')
											.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
											.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
											.end(function(err, response){
												du.debug('Confirm Order results', response.body);
												assert.property(response.body, "message");
												assert.equal(response.body.message, "Success");
												assert.property(response.body, "results");
												assert.property(response.body.results, "session");
												assert.property(response.body.results, "customer");
												assert.property(response.body.results, "transactions");
												assert.property(response.body.results, "transaction_products");
												
												//console.log(response.body.results.transactions);
												assert.equal(response.body.results.transactions.length, 2);
												assert.equal(response.body.results.transaction_products.length, 2);
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