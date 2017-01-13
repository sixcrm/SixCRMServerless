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

describe('Round Trip Test', function() {
  describe('Confirms a sales funnel purchase with partial and multiple upsells.', function() {
    it('Return a confirmed sale', function (done) {
    	
    	var request_time = new Date().getTime();
		var signature = crypto.createHash('sha1').update(config.secret_key+request_time).digest('hex');
    	var authorization_string = config.access_key+':'+request_time+':'+signature;
		
		var this_request = request(endpoint);
		console.log('Acquiring Token');
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
				
				console.log('Creating Lead');
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
						
					  	var products = ["4d3419f6-526b-4a68-9050-fc3ffcb552b4"];
					  	var order_create = {
							"session_id":session_id,
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
					  	
					  	console.log('Creating Order');
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
								
								var products = ["668ad918-0d09-4116-a6fe-0e7a9eda36f8"];
								var upsell_create = {
									"session_id":session_id,
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
								
								console.log('Creating Another Order');
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
										
										console.log('Confirming Order');
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