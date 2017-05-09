const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('underscore');

const tu = require('../../../lib/test-utilities.js');
const du = require('../../../lib/debug-utilities.js');

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

var entities = [
	{camel:'AccessKeys',lower:'accesskey'},
	{camel:'Accounts',lower:'account'},
	{camel:'Affiliates',lower:'affiliate'},
	{camel:'Campaigns',lower:'campaign'},
	{camel:'Customers',lower:'customer'},
	{camel:'EmailTemplates',lower:'emailtemplate'},
	{camel:'FulfillmentProviders',lower:'fulfillmentprovider'},
	{camel:'LoadBalancers',lower:'loadbalancer'},
	{camel:'MerchantProviders',lower:'merchantprovider'},
	{camel:'Notifications',lower:'notification'},
	{camel:'ProductSchedules',lower:'productschedule'},
	{camel:'Products',lower:'product'},
	{camel:'Rebills',lower:'rebill'},
	{camel:'Roles',lower:'role'},
	{camel:'Sessions',lower:'session'},
	{camel:'ShippingReceipts',lower:'shippingreceipt'},
	{camel:'SMTPProviders',lower:'smtpprovider'},
	{camel:'Transactions',lower:'transaction'},
	{camel:'Users',lower:'user'}
];

let testing_jwt = tu.createTestAuth0JWT('super.user@test.com', global.site_config.jwt.auth0.secret_key);
//Technical Debt:  Test pagination using all roles

entities.forEach((entity) => {
    describe('Graph Test', function() {
	  describe('Let\'s test the graph '+entity.camel+' endpoint for pagination properties!', function() {
      it(entity.camel+' Page 1 JSON results', function (done) {

          var limit = 1;
          let query_path = './endpoints/graph/queries/pagination/get'+entity.camel;
          var raw_query = tu.getQuery(query_path);
          var query = raw_query.split('{argumentation}');
          var query_arguments = 'pagination:{limit:"'+limit+'"}';

        	query = query[0]+query_arguments+query[1];

          var this_request = request(endpoint);

          var account = tu.getAccount('./endpoints/graph/queries/pagination/get'+entity.camel);

          du.debug('Query: ', query, 'Account: '+account, 'JWT: '+testing_jwt);

          this_request.post('graph/'+account)
				.set('Authorization', testing_jwt)
				.send(query)
				.expect(200)
				.expect('Content-Type', 'application/json')
				.expect('Access-Control-Allow-Origin','*')
				.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
				.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
				.end(function(err, response){

    tu.assertResultSet(response, global.test_users[0].role);

    assert.property(response.body.data[entity.lower+'list'].pagination, 'end_cursor');
    assert.property(response.body.data[entity.lower+'list'].pagination, 'has_next_page');
    assert.property(response.body.data[entity.lower+'list'].pagination, 'count');
    assert.property(response.body.data[entity.lower+'list'].pagination, 'last_evaluated');

    assert.equal(response.body.data[entity.lower+'list'][entity.lower+'s'].length, limit);
    assert.isAtMost(response.body.data[entity.lower+'list'].pagination.count, limit);

    assert.property(response.body.data[entity.lower+'list'][entity.lower+'s'][0], 'id');
    var returned_id = response.body.data[entity.lower+'list'][entity.lower+'s'][0].id;
    var cursor = response.body.data[entity.lower+'list'].pagination.end_cursor;
    var last_evaluated = response.body.data[entity.lower+'list'].pagination.last_evaluated;

    assert.equal(returned_id, cursor);

					//Technical Debt:  this doesn't appear to work yet...
    if(response.body.data[entity.lower+'list'].pagination.has_next_page == 'true'){

        assert.equal(response.body.data[entity.lower+'list'].pagination.count, limit);
        assert.isString(response.body.data[entity.lower+'list'].pagination.end_cursor);
        assert.isAbove(response.body.data[entity.lower+'list'].pagination.end_cursor.length, 0);

        var query = raw_query.split('{argumentation}');
        var query_arguments = 'pagination:{limit:"'+limit+'", cursor: "'+cursor+'", exclusive_start_key: '+JSON.stringify(last_evaluated)+'}';

        query = query[0]+query_arguments+query[1];

        du.debug('Query: ', query, 'Account: '+account, 'JWT: '+testing_jwt);

        this_request.post('graph/'+account)
							.set('Authorization', testing_jwt)
							.send(query)
							.expect(200)
							.expect('Content-Type', 'application/json')
							.expect('Access-Control-Allow-Origin','*')
							.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
							.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
							.end(function(err, response){

    tu.assertResultSet(response, global.test_users[0].role);

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
