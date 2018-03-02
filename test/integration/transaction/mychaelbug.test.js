'use strict'
const _ = require('underscore');
const chai = require('chai');
const expect = chai.expect;

const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib','model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const httputilities = global.SixCRM.routes.include('lib', 'http-utilities.js');
const random = global.SixCRM.routes.include('lib','random.js');
const signatureutilities = global.SixCRM.routes.include('lib','signature.js');
//const tu = global.SixCRM.routes.include('lib','test-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function createSignature(){

  let request_time = new Date().getTime();
  let secret_key = config.access_keys.super_user.secret_key;
  let access_key = config.access_keys.super_user.access_key;
  let signature = signatureutilities.createSignature(secret_key, request_time);

  return access_key+':'+request_time+':'+signature;

}

function createAffiliates(){

  let affiliates = null;

  arrayutilities.map(['affiliate', 'subaffiliate1', 'subaffiliate2', 'subaffiliate3', 'subaffiliate4', 'subaffiliate5', 'cid'], (field) => {
    if(random.randomBoolean()){
      if(_.isNull(affiliates)){
        affiliates = {};
      }
      affiliates[field] = random.createRandomString(20);
    }
  });

  return affiliates;

}

function getValidAcquireTokenPostBody(campaign){

  let affiliates = createAffiliates();

  let return_object = {
    campaign:(_.has(campaign, 'id'))?campaign.id:campaign
  };

  if(!_.isNull(affiliates)){
    return_object.affiliates = affiliates;
  }

  return return_object;

}

function confirmOrder(token, session){

  du.output('Confirm Order');

  let account = config.account;

  let querystring = httputilities.createQueryString({session: session});

  let argument_object = {
    //Technical Debt:  This is a hack - http-utilities.js should be adding the querystring from the qs parameter
    url: config.endpoint+'order/confirm/'+account+'?'+querystring,
    headers:{
      Authorization: token
    }
  };

  return httputilities.getJSON(argument_object)
  .then((result) => {
    du.debug(result.body);
    expect(result.response.statusCode).to.equal(200);
    expect(result.response.statusMessage).to.equal('OK');
    expect(result.body).to.have.property('success');
    expect(result.body).to.have.property('code');
    expect(result.body).to.have.property('response');
    expect(result.body.success).to.equal(true);
    expect(result.body.code).to.equal(200);


    let validated = mvu.validateModel(result.body.response, global.SixCRM.routes.path('model', 'endpoints/confirmOrder/response.json'));

    expect(validated).to.equal(true);
    return result.body;
  });

}
/*
function createUpsell(token, session, sale_object){

  du.output('Create Upsell');

  let account = config.account;
  let post_body = createOrderBody(session, sale_object);

  delete post_body.creditcard;
  post_body.transaction_subtype = 'upsell1';

  let argument_object = {
    url: config.endpoint+'order/create/'+account,
    body: post_body,
    headers:{
      Authorization: token
    }
  };

  return httputilities.postJSON(argument_object)
  .then((result) => {
    du.debug(result.body);
    expect(result.response.statusCode).to.equal(200);
    expect(result.response.statusMessage).to.equal('OK');
    expect(result.body).to.have.property('success');
    expect(result.body).to.have.property('code');
    expect(result.body).to.have.property('response');
    expect(result.body.success).to.equal(true);
    expect(result.body.code).to.equal(200);

    let validated = mvu.validateModel(result.body.response, global.SixCRM.routes.path('model','endpoints/createOrder/response.json'))

    expect(validated).to.equal(true);

    return result.body;

  });

}
*/
function createOrder(token, session, sale_object){

  du.output('Create Order');

  let account = config.account;
  let post_body = createOrderBody(session, sale_object);

  let argument_object = {
    url: config.endpoint+'order/create/'+account,
    body: post_body,
    headers:{
      Authorization: token
    }
  };

  return httputilities.postJSON(argument_object)
  .then((result) => {
    du.debug(result.body);
    expect(result.response.statusCode).to.equal(200);
    expect(result.response.statusMessage).to.equal('OK');
    expect(result.body).to.have.property('success');
    expect(result.body).to.have.property('code');
    expect(result.body).to.have.property('response');
    expect(result.body.success).to.equal(true);
    expect(result.body.code).to.equal(200);

    let validated = mvu.validateModel(result.body.response, global.SixCRM.routes.path('model','endpoints/createOrder/response.json'))

    expect(validated).to.equal(true);

    return result.body;
  });

}

function createLead(token, campaign){

  du.output('Create Lead');
  let account = config.account;
  let post_body = createLeadBody(campaign);

  let argument_object = {
    url: config.endpoint+'lead/create/'+account,
    body: post_body,
    headers:{
      Authorization: token
    }
  };

  return httputilities.postJSON(argument_object)
  .then((result) => {
    du.debug(result.body);
    expect(result.response.statusCode).to.equal(200);
    expect(result.response.statusMessage).to.equal('OK');
    expect(result.body).to.have.property('success');
    expect(result.body).to.have.property('code');
    expect(result.body).to.have.property('response');
    expect(result.body.success).to.equal(true);
    expect(result.body.code).to.equal(200);
    let validated = mvu.validateModel(result.body.response, global.SixCRM.routes.path('model','endpoints/createLead/response.json'))

    expect(validated).to.equal(true);
    return result.body.response.id;
  });

}

function acquireToken(campaign){

  du.output('Acquire Token');

  let account = config.account;
  let authorization_string = createSignature();
  var post_body = getValidAcquireTokenPostBody(campaign);

  let argument_object = {
    url: config.endpoint+'token/acquire/'+account,
    body: post_body,
    headers:{
      Authorization: authorization_string
    }
  };

  return httputilities.postJSON(argument_object)
  .then((result) => {
    du.debug(result.body);
    expect(result.response.statusCode).to.equal(200);
    expect(result.response.statusMessage).to.equal('OK');
    expect(result.body).to.have.property('success');
    expect(result.body).to.have.property('code');
    expect(result.body).to.have.property('response');
    expect(result.body.success).to.equal(true);
    expect(result.body.code).to.equal(200);
    expect(_.isString(result.body.response)).to.equal(true);
    let authorization_token = result.body.response;

    return authorization_token;
  });

}

function createCustomer(){

  let customer = MockEntities.getValidCustomer();

  delete customer.id;
  delete customer.account;
  delete customer.created_at;
  delete customer.updated_at;
  delete customer.creditcards;
  customer.billing = customer.address;

  return customer;

}

function createCreditCard(){

  let creditcard = MockEntities.getValidTransactionCreditCard();

  creditcard.number = "4111111111111111";

  return creditcard;

}

function createLeadBody(campaign){

  let return_object = {
    campaign:(_.has(campaign, 'id'))?campaign.id:campaign,
    customer: createCustomer()
  };

  let affiliates = createAffiliates();

  if(!_.isNull(affiliates)){ return_object.affiliates = affiliates; }

  return return_object;

}

function createOrderBody(session, sale_object){

  let return_object = objectutilities.clone(sale_object);

  return_object.session = session;
  return_object.creditcard = createCreditCard();
  return_object.transaction_subtype = 'main';

  return return_object;

}

let config = global.SixCRM.routes.include('test', 'integration/config/'+process.env.stage+'.yml');

//config.account = 'cb4a1482-1093-4d8e-ad09-fdd4d840b497';

let campaign = '71c3cac1-d084-4e12-ac75-cdb28987ae16';

xdescribe('Transaction Endpoints Round Trip Test',() => {

  describe('Test Case 1', () => {

    it('successfully executes', () => {

      let sale_object = {
        product_schedules:[{
  				quantity:1,
  				product_schedule:{
  					schedule:[
  						{
  							product:{
  								id:"6c6ec904-5315-4214-a057-79a7ff308cde",
  								name:"Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
  							},
  					    price:101.35,
  					    start:0,
  					    end:0,
  					    period:14
  						},
  						{
  							product:{
  								id:"92bd4679-8fb5-47ff-93f5-8679c46bcaad",
  								name:"Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
  							},
  					    price:62.35,
  					    start:0,
  					    end:0,
  					    period:14
  						}
  					]
  				}
  			}
  		],
  	  products:[
  			{
  				quantity: 1,
  				product: "4efa7820-38d4-4643-9745-ba581a665557",
  				price: 5.98
  			},
  			{
  				quantity: 1,
  				product: "78c02d93-e9e0-4077-817e-eaf6d3316b10",
  				price: 15.96
  			},
  			{
  				quantity: 1,
  				product: "ab9aa4d0-0c2e-47f3-a458-b4d0bc8f371e",
  				price: 20.97
  			}
  		]};

      return acquireToken(campaign)
      .then((token) => {

        return createLead(token, campaign)
        .then((session) => {
          return createOrder(token, session, sale_object)
          .then(() => confirmOrder(token, session))
          .then((result) => {
            du.warning(result);
          });
        });

      });

    });

  });

});
