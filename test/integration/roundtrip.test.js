var request = require('supertest');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert
var fs = require('fs');
var yaml = require('js-yaml');
var crypto = require('crypto');

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
		
		var this_request = request(endpoint);
		console.log(appropriate_spacing+'Acquiring Token');
    	this_request.get('token/acquire/')
			.set('Content-Type', 'application/json')
			.set('Authorization', authorization_string)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end(function(err, response){
				assert.isObject(response.body);
				assert.property(response.body, "message");
				assert.equal(response.body.message, "Success");
				assert.property(response.body, "token");
				assert.isString(response.body.token);
				
				var jwt = response.body.token;		
				
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
				
				console.log(appropriate_spacing+'Creating Lead');
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
						assert.property(response.body, "message");
						assert.equal(response.body.message, "Success");
						assert.property(response.body, "results");
						assert.property(response.body.results, "session");
						assert.property(response.body.results, "customer");
						assert.isString(response.body.results.session.id);
						assert.isObject(response.body.results.customer);
				
						var session_id = response.body.results.session.id;
						var campaign_id = '70a6689a-5814-438b-b9fd-dd484d0812f9';
					  	var products = ["be992cea-e4be-4d3e-9afa-8e020340ed16"];
					  	
					  	var order_create = {
							"session_id":session_id,
							"products":products,
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
					  	
					  	console.log(appropriate_spacing+'Creating Order');
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
								assert.property(response.body, "message");
								assert.equal(response.body.message, "Success");
								assert.property(response.body, "results");
								assert.property(response.body.results, "parentsession");
								assert.isString(response.body.results.parentsession);
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
								
								var products = ["616cc994-9480-4640-b26c-03810a679fe3"];
								var upsell_create = {
									"session_id":session_id,
									"campaign_id":campaign_id,
									"products":products,
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
								
								console.log(appropriate_spacing+'Creating Another Order');
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
										assert.property(response.body, "message");
										assert.equal(response.body.message, "Success");
										assert.property(response.body, "results");
										assert.property(response.body.results, "parentsession");
										assert.isString(response.body.results.parentsession);
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
										
										console.log(appropriate_spacing+'Confirming Order');
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
												assert.property(response.body, "message");
												assert.equal(response.body.message, "Success");
												assert.property(response.body, "results");
												assert.property(response.body.results, "session");
												assert.property(response.body.results, "customer");
												assert.property(response.body.results, "products");

												done();
											}, done);
											
									}, done);
						}, done);
					}, done);
			}, done);
		});
	});		
});