'use strict'

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

function getValidMerchantProviderConfiguation(){
  return {
    username:"test@example.com",
    password:"Passw0rd!1",
    site_id: "0",
    merchant_account_id: "100",
    product_id: "1001"
  };
}

function getValidParametersObject(){
  return {
    request_response_format: 'JSON',
    request_api_version: '3.6',
    req_username: 'Tim',
    req_password: 'TestingPassword',
    site_id: '1',
    merchant_acct_id: 'absasdasd',
    li_prod_id_1: '1'
  };
}

function getValidMethodParametersObject(){
  return {request_action: 'CCAUTHCAP'};
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
        state:'California',
        zip:'90066',
        country: 'US'
      }
    },
    customer: {
      id: 'randomid',
      firstname: 'John',
      lastname: 'Doe',
      email:'user5@example.com'
    },
    session: {
      ip_address:'10.00.000.90',
    },
    transaction: {
      alias:'ABC123'
    }
  };

}

describe('vendors/merchantproviders/Innovio.js', () => {

  before(() => {
      mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
      });
  });

  afterEach(() => {
      mockery.resetCache();
  });

  after(() => {
      mockery.deregisterAll();
  });

  it('Should fail due to missing properties', () => {

    const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

    try {
      let innovio_controller = new InnovioController({});
    }catch(error){
      expect(error.message).to.equal('[500] One or more validation errors occurred.');
    }

  });

  it('Should Instantiate the Innovio Controller', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

    let innovio_controller = new InnovioController(merchant_provider_configuration);

    expect(innovio_controller.constructor.name).to.equal('InnovioController');

  });

  it('Should set vendor and merchant_provider parameters in request object', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

    let innovio_controller = new InnovioController(merchant_provider_configuration);

    let parameters_object = innovio_controller.createParameterObject();

    //cust_login=username1&cust_password=12345678Xx&xtl_cust_id=c777777777&xtl_order_id=o111111111&li_value_1=19.95&li_count_1=1request_response_format=XML

    const required_properties = {
      request_response_format: 'JSON',
      request_api_version: '3.6',
      req_username: 'test@example.com',
      req_password: 'Passw0rd!1',
      site_id: '0',
      merchant_acct_id: '100',
      li_prod_id_1: '1001'
    }

    objectutilities.map(required_properties, (key) => {
      expect(parameters_object).to.have.property(key);
      expect(parameters_object[key]).to.equal(required_properties[key]);
    });

  });

  it('Should set method parameters in request object', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

    let innovio_controller = new InnovioController(merchant_provider_configuration);

    let parameters_object = getValidParametersObject();

    let method_parameters = getValidMethodParametersObject();

    parameters_object = innovio_controller.setMethodParameters({return_parameters: parameters_object, method_parameters: method_parameters});

    const required_properties = {
      request_response_format: 'JSON',
      request_api_version: '3.6',
      req_username: 'Tim',
      req_password: 'TestingPassword',
      site_id: '1',
      merchant_acct_id: 'absasdasd',
      li_prod_id_1: '1',
      request_action: 'CCAUTHCAP'
    };

    objectutilities.map(required_properties, (key) => {
      expect(parameters_object).to.have.property(key);
      expect(parameters_object[key]).to.equal(required_properties[key]);
    });

  });

  it('Should set request parameters in request object', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

    let innovio_controller = new InnovioController(merchant_provider_configuration);

    let parameters_object = getValidParametersObject();

    let request_parameters = getValidRequestParametersObject();

    parameters_object = innovio_controller.setRequestParameters({type: 'process', request_parameters: request_parameters, return_parameters: parameters_object});

    const required_properties = {
      request_response_format: 'JSON',
      request_api_version: '3.6',
      req_username: 'Tim',
      req_password: 'TestingPassword',
      site_id: '1',
      merchant_acct_id: 'absasdasd',
      li_prod_id_1: '1',
      li_value_1: 100,
      li_count_1: 3,
      pmt_numb: '5105105105105100',
      pmt_key: '123',
      pmt_expiry: '12/2014',
      cust_fname: 'John',
      cust_lname: 'Doe',
      cust_email: 'user5@example.com',
      bill_addr: '123 Main Street Apt. 1',
      bill_addr_city: 'Los Angeles',
      bill_addr_state: 'California',
      bill_addr_zip: '90066',
      bill_addr_country: 'US',
      xtl_order_id: 'ABC123',
      xtl_cust_id: 'randomid',
      xtl_ip: '10.00.000.90'
    };

    objectutilities.map(required_properties, (key) => {
      expect(parameters_object).to.have.property(key);
      expect(parameters_object[key]).to.equal(required_properties[key]);
    });

  });

  it('Should complete a "process" request', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

    let innovio_controller = new InnovioController(merchant_provider_configuration);

    let parameters_object = getValidParametersObject();

    let method_parameters = getValidMethodParametersObject();

    let request_parameters = getValidRequestParametersObject();

    parameters_object = innovio_controller.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters_object});

    parameters_object = innovio_controller.setRequestParameters({type: 'process', request_parameters: request_parameters, return_parameters: parameters_object});

    innovio_controller.validateRequestParameters('process', parameters_object);

    expect(true).to.equal(true);

  });

  it('Should process a transaction', () => {

    let mocked_callback = {
      API_RESPONSE: 600,
      TRANS_STATUS_NAME: 'Declined'
    };

    mockery.registerMock('request', {
      post: (request_options, callback) => {
        callback(null, null, JSON.stringify(mocked_callback));
      }
    });

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

    let innovio_controller = new InnovioController(merchant_provider_configuration);

    let request_parameters = getValidRequestParametersObject();

    return innovio_controller.process(request_parameters).then(response => {

      expect(response).to.have.property('message');
      expect(response).to.have.property('result');

    });

  });

});
