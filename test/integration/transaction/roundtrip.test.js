var request = require('supertest');
var chai = require('chai');

chai.use(require('chai-json-schema'));
var assert = require('chai').assert
var fs = require('fs');
var yaml = require('js-yaml');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const random = global.SixCRM.routes.include('lib','random.js');
const signatureutilities = global.SixCRM.routes.include('lib','signature.js');
const tu = global.SixCRM.routes.include('lib','test-utilities.js');

try {
    var config = yaml.safeLoad(fs.readFileSync('./test/integration/config/'+process.env.stage+'.yml', 'utf8'));
} catch (e) {
    du.warning(e);
}

var endpoint = config.endpoint;
var appropriate_spacing = '        ';

describe('Transaction Round Trip Test',() => {
  describe('Confirms a sales funnel purchase with partial and multiple upsells.', () => {
    it('Returns a confirmed sale', (done) => {

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
      du.warning('token/acquire/'+account, authorization_string, post_body)
    	this_request.post('token/acquire/'+account)
      .send(post_body)
			.set('Content-Type', 'application/json')
			.set('Authorization', authorization_string)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end((err, response) => {
        du.debug(response.body);
        tu.assertSuccessfulResponse(response.body, 'graph');

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
              "state":"MI",
              "zip":"12345",
              "country":"US"
            },
            "address":{
              "line1":"334 Lombard St.",
              "line2":"Apartment 2",
              "city":"Portland",
              "state":"OR",
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
					.end((err, response) => {
            du.debug('Create Lead Response', response.body);
            tu.assertSuccessfulResponse(response.body, 'graph');
            assert.property(response.body.response, "id");
            assert.property(response.body.response, "customer");
            assert.equal(response.body.response.campaign, campaign_id, 'Campaign');
            assert.property(response.body.response, "affiliate");
            assert.property(response.body.response, "subaffiliate_1");
            assert.property(response.body.response, "subaffiliate_2");
            assert.property(response.body.response, "subaffiliate_3");
            assert.property(response.body.response, "subaffiliate_4");
            assert.property(response.body.response, "subaffiliate_5");

            var session_id = response.body.response.id;
					  var product_schedules = [{
							"product_schedule": "12529a17-ac32-4e46-b05b-83862843055d",
							"quantity":2
						}];

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
                  "state":"OR",
                  "zip":"97213",
                  "country":"US"
                }
              },
              "transaction_subtype":"main"
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
						.end((err, response) => {
              du.debug('Create Order Response:', response.body);

              tu.assertSuccessfulResponse(response.body, 'graph');

              var upsell_product_schedules = [{
                product_schedule: '8d1e896f-c50d-4a6b-8c84-d5661c16a046',
                quantity: 1
              }];

              var upsell_create = {
                "session": session_id,
                "product_schedules": upsell_product_schedules,
                "transaction_subtype":"upsell1"
              };

              du.debug('Upsell Post Data:', upsell_create);

              du.output(appropriate_spacing+'Creating Another Order');

              du.debug('order/create/'+account);

              this_request.post('order/create/'+account)
							.send(upsell_create)
							.set('Content-Type', 'application/json')
							.set('Authorization', jwt)
							.expect(200)
							.expect('Content-Type', 'application/json')
							.expect('Access-Control-Allow-Origin','*')
							.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
							.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
							.end((err, response) => {
                du.debug('Upsell Result: ', response.body);
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
								.end((err, response) => {

                  du.debug('Confirm Order results', response.body);

                  done();

                }, done);

              }, done);

            }, done);

          }, done);

        }, done);

      });

  });
  describe('Tests failure ceses.', () => {
    it('Returns an error when invalid campaign id is sent', (done) => {

      let request_time = new Date().getTime();
      let secret_key = config.access_keys.super_user.secret_key;
      let access_key = config.access_keys.super_user.access_key;
      let account = config.account;
      var campaign_id = 'not-a-uuid';

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
      du.warning('token/acquire/'+account, authorization_string, post_body)
    	this_request.post('token/acquire/'+account)
      .send(post_body)
			.set('Content-Type', 'application/json')
			.set('Authorization', authorization_string)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end((err, response) => {
        du.debug(response.body);

        tu.assertUnsuccessfulResponse(response.body, 'graph');

        done();
        }, done);

      });
    it('Returns an error when wrong campaign id is sent', (done) => {

      let request_time = new Date().getTime();
      let secret_key = config.access_keys.super_user.secret_key;
      let access_key = config.access_keys.super_user.access_key;
      let account = config.account;
      var campaign_id = '9e43883f-7dcc-4d7a-8767-9d688c9401b8'; // wrong id, we dont have such campaign

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
      du.warning('token/acquire/'+account, authorization_string, post_body)
    	this_request.post('token/acquire/'+account)
      .send(post_body)
			.set('Content-Type', 'application/json')
			.set('Authorization', authorization_string)
			.expect(200)
			.expect('Content-Type', 'application/json')
			.expect('Access-Control-Allow-Origin','*')
			.expect('Access-Control-Allow-Methods', 'OPTIONS,POST')
			.expect('Access-Control-Allow-Headers','Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token')
			.end((err, response) => {
        du.debug(response.body);

        tu.assertUnsuccessfulResponse(response.body, 'graph');

        assert.equal(response.body.message, '[400] Invalid Campaign ID: ' + campaign_id);

        done();
        }, done);

      });

  });

});
