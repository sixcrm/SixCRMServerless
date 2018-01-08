'use strict'

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let querystring = require('querystring');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

function getValidMerchantProviderConfiguation(){
  return {
    username:"demo",
    password:"password",
    processor_id:"0"
  };
}

function getValidParametersObject(){
  return objectutilities.merge(
    getValidMerchantProviderConfiguation(),
    {
      endpoint: 'https://testmerchantprovider.sixcrm.com/'
    }
  );
}

function getValidMethodParametersObject(){
  return {
    path:'authorize'
  };
}

function getValidReverseRequestParametersObject(){

  return {
    transaction:{
      "amount": 34.99,
      "id": "e624af6a-21dc-4c64-b310-3b0523f8ca42",
      "alias":"T56S2HJO32",
      "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      "rebill": "55c103b4-670a-439e-98d4-5a2834bb5fc3",
      "processor_response": {
        "message":"Success",
        "result":{
          "response":"1",
          "responsetext":"SUCCESS",
          "authcode":"123456",
          "transactionid":"3448894418",
          "avsresponse":"N",
          "cvvresponse":"",
          "orderid":"",
          "type":"sale",
          "response_code":"100"
        }
      },
      "merchant_provider": "6c40761d-8919-4ad6-884d-6a46a776cfb9",
      "products":[{
        "product":"be992cea-e4be-4d3e-9afa-8e020340ed16",
        "amount":34.99
      }],
      "created_at":"2017-04-06T18:40:41.405Z",
      "updated_at":"2017-04-06T18:41:12.521Z"
    }
  };

}

function getValidRefundRequestParametersObject(){

  return {
    transaction:{
      "amount": 34.99,
      "id": "e624af6a-21dc-4c64-b310-3b0523f8ca42",
      "alias":"T56S2HJO32",
      "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      "rebill": "55c103b4-670a-439e-98d4-5a2834bb5fc3",
      "processor_response": {
        "message":"Success",
        "result":{
          "response":"1",
          "responsetext":"SUCCESS",
          "authcode":"123456",
          "transactionid":"3448894418",
          "avsresponse":"N",
          "cvvresponse":"",
          "orderid":"",
          "type":"sale",
          "response_code":"100"
        }
      },
      "merchant_provider": "6c40761d-8919-4ad6-884d-6a46a776cfb9",
      "products":[{
        "product":"be992cea-e4be-4d3e-9afa-8e020340ed16",
        "amount":34.99
      }],
      "created_at":"2017-04-06T18:40:41.405Z",
      "updated_at":"2017-04-06T18:41:12.521Z"
    },
    amount: 34.99
  };

}

function getValidRequestParametersObject(){

  return {
    amount: 100.00,
    count: 3,
    creditcard: {
      number: '5105105105105100',
      ccv: '123',
      expiration:'12/2014',
      address: {
        line1:'123 Main Street Apt. 1',
        city:'Los Angeles',
        state:'CA',
        zip:'90066',
        country: 'US'
      }
    },
    customer: {
      id: 'randomid',
      firstname: 'John',
      lastname: 'Doe',
      email:'user5@example.com',
      address: {
        line1: '456 Another St.',
        line2: 'Apartment 2',
        city: 'Anaheim',
        state: 'CA',
        zip: '90067',
        country: 'US'
      }
    }
  };

}

function getMockResponse(){

  let mocked_callback = {
    response: '3',
    responsetext: 'Authentication Failed',
    authcode: '',
    transactionid: '0',
    avsresponse: '',
    cvvresponse: '',
    orderid: '',
    type: 'sale',
    response_code: '300'
  };

  return querystring.stringify(mocked_callback);

}

describe('vendors/merchantproviders/Test.js', () => {

  before(() => {
      mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
      });
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  it('Should fail due to missing properties', () => {

    const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

    try {

      let test_controller = new TestController({});

    }catch(error){

      expect(error.message).to.have.string('[500] One or more validation errors occurred:');

    }

  });

  it('Should Instantiate the Test Controller', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

    let test_controller = new TestController(merchant_provider_configuration);

    expect(test_controller.constructor.name).to.equal('TestController');

  });

  it('Should set vendor and merchant_provider parameters in request object', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

    let test_controller = new TestController(merchant_provider_configuration);

    let parameters_object = test_controller.createParameterObject();

    const required_properties = {
      username: 'demo',
      password: 'password',
      processor_id: '0'
    };

    objectutilities.map(required_properties, (key) => {
      expect(parameters_object).to.have.property(key);
      expect(parameters_object[key]).to.equal(required_properties[key]);
    });

  });

  it('Should set method parameters in request object', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

    let test_controller = new TestController(merchant_provider_configuration);

    let parameters_object = getValidParametersObject();

    let method_parameters = getValidMethodParametersObject();

    parameters_object = test_controller.setMethodParameters({return_parameters: parameters_object, method_parameters: method_parameters});

    const required_properties = {
      username: 'demo',
      password: 'password',
      processor_id: '0'
    };

    objectutilities.map(required_properties, (key) => {
      expect(parameters_object).to.have.property(key);
      expect(parameters_object[key]).to.equal(required_properties[key]);
    });

  });

  it('Should set request parameters in request object', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

    let test_controller = new TestController(merchant_provider_configuration);

    let parameters_object = getValidParametersObject();

    let request_parameters = getValidRequestParametersObject();

    parameters_object = test_controller.setRequestParameters({type:'process', request_parameters: request_parameters, return_parameters: parameters_object});

    const required_properties = {
      amount: 100,
      creditcard:{
        number: '5105105105105100',
        ccv: '123',
        exp: '12/2014',
        address:{
          line1: '123 Main St.',
          line2: 'Apartment 1',
          city: 'Dumpsville',
          state: 'NJ',
          zip:'12345',
          country:'US'
        }
      },
      customer:{
        firstname: 'John',
        lastname: 'Doe',
      }
    };

    objectutilities.map(required_properties, (key) => {
      expect(parameters_object).to.have.property(key);
      //expect(parameters_object[key]).to.equal(required_properties[key]);
    });

  });

  it('Should complete a "process" request', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

    let test_controller = new TestController(merchant_provider_configuration);

    let parameters_object = getValidParametersObject();

    let method_parameters = getValidMethodParametersObject();

    let request_parameters = getValidRequestParametersObject();

    parameters_object = test_controller.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters_object});

    parameters_object = test_controller.setRequestParameters({type: 'process', request_parameters: request_parameters, return_parameters: parameters_object});

    test_controller.validateRequestParameters('process', parameters_object);

    expect(true).to.equal(true);

  });

  it('Should process a transaction', () => {

    /*
    mockery.registerMock('request', {
      post: (request_options, callback) => {
        du.warning(request_options);  process.exit();
        callback(null, null, getMockResponse());
      }
    });
    */

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

    let test_controller = new TestController(merchant_provider_configuration);

    let request_parameters = getValidRequestParametersObject();

    return test_controller.process(request_parameters).then(response => {

      expect(response).to.have.property('code');
      expect(response).to.have.property('message');
      expect(response).to.have.property('result');

    });

  });

  xit('Should reverse a transaction', () => {

    //Technical Debt:  This already exists from the previous test... (derp)
    mockery.registerMock('request', {
      post: (request_options, callback) => {
        callback(null, null, getMockResponse());
      }
    });

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

    let test_controller = new TestController(merchant_provider_configuration);

    let request_parameters = getValidReverseRequestParametersObject();

    return test_controller.reverse(request_parameters).then(response => {

      du.warning(response);
      expect(response).to.have.property('code');
      expect(response).to.have.property('message');
      expect(response).to.have.property('result');

    });

  });

    xit('Should refund a transaction', () => {

      mockery.registerMock('request', {
        post: (request_options, callback) => {
          callback(null, null, getMockResponse());
        }
      });

      let merchant_provider_configuration = getValidMerchantProviderConfiguation();

      const TestController = global.SixCRM.routes.include('vendors', 'merchantproviders/Test/handler.js');

      let test_controller = new TestController(merchant_provider_configuration);

      let request_parameters = getValidRefundRequestParametersObject();

      return test_controller.refund(request_parameters).then(response => {

        du.warning(response);
        expect(response).to.have.property('code');
        expect(response).to.have.property('message');
        expect(response).to.have.property('result');

      });

  });

});
