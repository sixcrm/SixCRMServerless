const request = require('supertest');
const chai = require('chai');
const assert = require('chai').assert
const fs = require('fs');
const yaml = require('js-yaml');

const tu = global.routes.include('lib','test-utilities.js');
const du = global.routes.include('lib','debug-utilities.js');

chai.use(require('chai-json-schema'));

let endpoint = global.integration_test_config.endpoint;

var entity = 'Shipping Receipts';
var tests = [{
    name: "index",
    query: global.routes.path('handlers','endpoints/graph/queries/index/getShippingReceipts')
},
{
    name: "view",
    query: global.routes.path('handlers','endpoints/graph/queries/view/getShippingReceipt')
},
{
    name: "create",
    query: global.routes.path('handlers','endpoints/graph/queries/create/createShippingReceipt')
},
{
    name: "update",
    query: global.routes.path('handlers','endpoints/graph/queries/update/updateShippingReceipt')
},
{
    name: "delete",
    query: global.routes.path('handlers','endpoints/graph/queries/delete/deleteShippingReceipt')
}];

let this_request = request(endpoint);

describe('Graph '+entity+' Test', function() {

  	global.test_accounts.forEach((test_account) => {

  		global.test_users.forEach((test_user) => {

      describe('Test the graph '+entity+' endpoint using "'+test_user.name+'" credentials on the account "'+test_account.name+'"', function() {

          let test_jwt = tu.createTestAuth0JWT(test_user.email, global.site_config.jwt.auth0.secret_key);

          tests.forEach((test) => {

					//let account = tu.getAccount(test.query);
              let account = test_account.id;

              it('Should return only '+test_user.name+' fields for '+entity+' '+test.name+'.', function (done) {
                  var query = tu.getQuery(test.query);

                  this_request.post('graph/'+account)
							.set('Authorization', test_jwt)
							.send(query)
							.expect(200)
							.expect('Content-Type', 'application/json')
							.expect('Access-Control-Allow-Origin','*')
							.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
							.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
							.end(function(err, response){
    tu.assertResultSet(response, test_user.role);
    done();
});
              });
          });

      });

  });

  });

});
