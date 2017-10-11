'use strict'

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

function getValidMerchantProviderConfiguation(){
  return {
    username:"timothy.dalbey@sixrm.com",
    password:"vIngelB92SWGNBDHTTQK",
    site_id: "45481",
    merchant_account_id: "47769",
    product_id: "64219"
  };
}

function getValidRequestParametersObject(){

  return {
    amount: 0.99,
    count: 2,
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

  it('Should complete a sale', () => {

    let merchant_provider_configuration = getValidMerchantProviderConfiguation();

    const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

    let innovio_controller = new InnovioController(merchant_provider_configuration);

    let request_parameters = getValidRequestParametersObject();

    return innovio_controller.process(request_parameters).then(response => {

      expect(response).to.have.property('message');
      expect(response).to.have.property('result');
      expect(response).to.have.property('code');

      expect(response.code).to.equal('success');
      expect(response.message).to.equal('APPROVED');

    });

  });

  xit('Should complete a refund', () => {

  });

  xit('Should complete a void', () => {

  });

});
