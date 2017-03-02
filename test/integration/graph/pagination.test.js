var request = require('supertest');
var chai = require('chai');
chai.use(require('chai-json-schema'));
var assert = require('chai').assert
var fs = require('fs');
var yaml = require('js-yaml');
var crypto = require('crypto');

var tu = require('../../../lib/test-utilities.js');

try {
  var config = yaml.safeLoad(fs.readFileSync('./test/integration/config/'+environment+'.yml', 'utf8'));
} catch (e) {
  console.log(e);
}

var endpoint = config.endpoint;
var entities = [
	{camel:'AccessKeys',lower:'accesskey'}, 
	{camel:'Affiliates',lower:'affiliate'},
	{camel:'Campaigns',lower:'campaign'},
	{camel:'Customers',lower:'customer'},
	{camel:'Emails',lower:'email'},
	{camel:'FulfillmentProviders',lower:'fulfillmentprovider'},
	{camel:'LoadBalancers',lower:'loadbalancer'},
	{camel:'MerchantProviders',lower:'merchantprovider'},
	{camel:'ProductSchedules',lower:'productschedule'},
	{camel:'Products',lower:'product'},
	{camel:'Rebills',lower:'rebill'},
	{camel:'Sessions',lower:'session'},
	{camel:'ShippingReceipts',lower:'shippingreceipt'},
	{camel:'SMTPProviders',lower:'smtpprovider'},
	{camel:'Transactions',lower:'transaction'},
	{camel:'Users',lower:'user'}
];
	
var endpoint = config.endpoint;

entities.forEach((entity) => {
	describe('Graph Test', function() {
	  describe('Let\'s test the graph '+entity.camel+' endpoint for pagination properties!', function() {
		it(entity.camel+' Page 1 JSON results', function (done) {
			
			var limit = 1;
			var raw_query = tu.getQuery('./endpoints/graph/queries/pagination/get'+entity.camel);
			var query = raw_query.split('{argumentation}');
			var query_arguments = 'limit:"'+limit+'"';
			var query = query[0]+query_arguments+query[1];
			
			console.log(query);
			var this_request = request(endpoint);
			this_request.post('graph/')
				.set('Authorization', global.site_jwt)
				.send(query)
				.expect(200)
				.expect('Content-Type', 'application/json')
				.expect('Access-Control-Allow-Origin','*')
				.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
				.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
				.end(function(err, response){
				
					tu.assertResultSet(response);
					
					assert.property(response.body.data[entity.lower+'list'].pagination, 'end_cursor');
					assert.property(response.body.data[entity.lower+'list'].pagination, 'has_next_page');
					assert.property(response.body.data[entity.lower+'list'].pagination, 'count');
					
					console.log(response.body.data[entity.lower+'list']);
					assert.equal(response.body.data[entity.lower+'list'][entity.lower+'s'].length, limit);
					assert.isAtMost(response.body.data[entity.lower+'list'].pagination.count, limit);
						
					assert.property(response.body.data[entity.lower+'list'][entity.lower+'s'][0], 'id');
					var returned_id = response.body.data[entity.lower+'list'][entity.lower+'s'][0].id;
					var cursor = response.body.data[entity.lower+'list'].pagination.end_cursor;
					
					assert.equal(returned_id, cursor);
					
					//Technical Debt:  this doesn't appear to work yet...
					if(response.body.data[entity.lower+'list'].pagination.has_next_page == 'true'){
				
						assert.equal(response.body.data[entity.lower+'list'].pagination.count, limit);
						assert.isString(response.body.data[entity.lower+'list'].pagination.end_cursor);
						assert.isAbove(response.body.data[entity.lower+'list'].pagination.end_cursor.length, 0);
					
						var query = raw_query.split('{argumentation}');
						var query_arguments = 'limit:"'+limit+'", cursor: "'+cursor+'"';
						var query = query[0]+query_arguments+query[1];
					
						this_request.post('graph/')
							.set('Authorization', global.site_jwt)
							.send(query)
							.expect(200)
							.expect('Content-Type', 'application/json')
							.expect('Access-Control-Allow-Origin','*')
							.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
							.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
							.end(function(err, response){
							
								tu.assertResultSet(response);
								
								if(response.body.data[entity.lower+'list'].pagination.count > 0){
									assert.equal(response.body.data[entity.lower+'list'].pagination.count, limit);
								
									var new_returned_id = response.body.data[entity.lower+'list'][entity.lower+'s'][0].id;
		
									assert.isNotTrue(new_returned_id == returned_id);
								
									done();
								}else{
									done();
								}
							});
				
					}else{
						done();
					}
			
				}, done);
			});
		});
	});
});