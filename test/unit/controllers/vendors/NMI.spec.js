'use strict'

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let querystring = require('querystring');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

function getValidMerchantProviderConfiguation(){
  return {
    username:"test@example.com",
    password:"Passw0rd!1",
    processor_id: "0"
  };
}

function getValidParametersObject(){
  return objectutilities.merge(
    getValidMerchantProviderConfiguation(),
    {endpoint: 'https://secure.networkmerchants.com/api/transact.php'}
  );
}

function getValidMethodParametersObject(){
  return {type: 'sale'};
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
      email:'user5@example.com',
      address: {
        line1: '456 Another St.',
        line2: 'Apartment 2',
        city: 'Anaheim',
        state: 'California',
        zip: '90067',
        country: 'US'
      }
    },
    session: {
      ip_address:'10.00.000.90',
    },
    transaction: {
      alias:'ABC123'
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

describe('vendors/merchantproviders/NMI.js', () => {

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

    const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

    try {

      let nmi_controller = new NMIController({});

    }catch(error){

      expect(error.message).to.equal('[500] One or more validation errors occurred.');

    }

  });

  it('Should Instantiate the NMI Controller', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

    let nmi_controller = new NMIController(merchant_provider_configuration);

    expect(nmi_controller.constructor.name).to.equal('NMIController');

  });

  it('Should set vendor and merchant_provider parameters in request object', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

    let nmi_controller = new NMIController(merchant_provider_configuration);

    let parameters_object = nmi_controller.createParameterObject();

    const required_properties = {
      endpoint: 'https://secure.networkmerchants.com/api/transact.php',
      username: 'test@example.com',
      password: 'Passw0rd!1',
      processor_id: '0'
    };

    objectutilities.map(required_properties, (key) => {
      expect(parameters_object).to.have.property(key);
      expect(parameters_object[key]).to.equal(required_properties[key]);
    });

  });

  it('Should set method parameters in request object', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

    let nmi_controller = new NMIController(merchant_provider_configuration);

    let parameters_object = getValidParametersObject();

    let method_parameters = getValidMethodParametersObject();

    parameters_object = nmi_controller.setMethodParameters({return_parameters: parameters_object, method_parameters: method_parameters});

    const required_properties = {
      username: 'test@example.com',
      password: 'Passw0rd!1',
      processor_id: '0',
      endpoint: 'https://secure.networkmerchants.com/api/transact.php',
      type: 'sale'
    };

    objectutilities.map(required_properties, (key) => {
      expect(parameters_object).to.have.property(key);
      expect(parameters_object[key]).to.equal(required_properties[key]);
    });

  });

  it('Should set request parameters in request object', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

    let nmi_controller = new NMIController(merchant_provider_configuration);

    let parameters_object = getValidParametersObject();

    let request_parameters = getValidRequestParametersObject();

    parameters_object = nmi_controller.setRequestParameters({request_parameters: request_parameters, return_parameters: parameters_object});

    const required_properties = {
      username: 'test@example.com',
      password: 'Passw0rd!1',
      processor_id: '0',
      endpoint: 'https://secure.networkmerchants.com/api/transact.php',
      amount: 100,
      ccnumber: '5105105105105100',
      ccv: '123',
      ccexp: '12/2014',
      firstname: 'John',
      lastname: 'Doe',
      address1: '123 Main Street Apt. 1',
      city: 'Los Angeles',
      state: 'California',
      zip: '90066',
      country: 'US',
      shipping_address1: '456 Another St.',
      shipping_address2: 'Apartment 2',
      shipping_city: 'Anaheim',
      shipping_state: 'California',
      shipping_zip: '90067',
      shipping_country: 'US'
    };

    objectutilities.map(required_properties, (key) => {
      expect(parameters_object).to.have.property(key);
      expect(parameters_object[key]).to.equal(required_properties[key]);
    });

  });

  it('Should complete a "process" request', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

    let nmi_controller = new NMIController(merchant_provider_configuration);

    let parameters_object = getValidParametersObject();

    let method_parameters = getValidMethodParametersObject();

    let request_parameters = getValidRequestParametersObject();

    parameters_object = nmi_controller.setMethodParameters({method_parameters: method_parameters, return_parameters: parameters_object});

    parameters_object = nmi_controller.setRequestParameters({request_parameters: request_parameters, return_parameters: parameters_object});

    nmi_controller.validateRequestParameters('process', parameters_object);

    expect(true).to.equal(true);

  });

  it('Should process a transaction', () => {

    mockery.registerMock('request', {
      post: (request_options, callback) => {
        callback(null, null, getMockResponse());
      }
    });

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const NMIController = global.SixCRM.routes.include('vendors', 'merchantproviders/NMI/handler.js');

    let nmi_controller = new NMIController(merchant_provider_configuration);

    let request_parameters = getValidRequestParametersObject();

    return nmi_controller.process(request_parameters).then(response => {

      expect(response).to.have.property('code');
      expect(response).to.have.property('message');
      expect(response).to.have.property('result');

    });

  });

});
