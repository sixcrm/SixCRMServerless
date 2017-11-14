'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const RegisterResponseController = global.SixCRM.routes.include('providers', 'register/Response.js');

function getValidTransaction(){
  return {
    "amount": 34.99,
    "id": "e624af6a-21dc-4c64-b310-3b0523f8ca42",
    "alias":"T56S2HJO32",
    "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    "rebill": "55c103b4-670a-439e-98d4-5a2834bb5fc3",
    "processor_response": "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894418\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
    "merchant_provider": "6c40761d-8919-4ad6-884d-6a46a776cfb9",
    "products":[{
      "product":"be992cea-e4be-4d3e-9afa-8e020340ed16",
      "amount":34.99
    }],
    "type":"sale",
    "result":"success",
    "created_at":"2017-04-06T18:40:41.405Z",
    "updated_at":"2017-04-06T18:41:12.521Z"
  };
}

function getValidProcessorResponse(){

  return {
    code: 'success',
    result: {
      message: "Success",
      result:{
        response:"1",
        responsetext:"SUCCESS",
        authcode:"123456",
        transactionid:"3448894418",
        avsresponse:"N",
        cvvresponse:"",
        orderid:"",
        type:"sale",
        response_code:"100"
      }
    },
    message: 'Some message'
  };

}

describe('controllers/providers/register/Response.js', () => {

  describe('constructor', () => {
    it('successfully executes the constructor', () => {

      let registerResponseController = new RegisterResponseController();

      expect(registerResponseController).to.have.property('merged_parameter_validation');
      expect(registerResponseController.merged_parameter_validation).to.have.property('transaction');
      expect(registerResponseController.merged_parameter_validation).to.have.property('processorresponse');

      expect(registerResponseController).to.have.property('merged_parameter_definition');
      expect(registerResponseController.merged_parameter_definition).to.have.property('constructor');
      expect(registerResponseController.merged_parameter_definition['constructor'].optional).to.deep.equal({
        response_type:'response_type',
        transaction:'transaction',
        processorresponse:'processor_response',
        creditcard:'creditcard'
      });

    });

    it('successfully executes the constructor with argumentation', () => {

      let transaction = getValidTransaction();
      let processor_response = getValidProcessorResponse();
      let response_type = 'success';

      let registerResponseController = new RegisterResponseController({transaction: transaction, processor_response: processor_response, response_type: response_type});

      expect(registerResponseController).to.have.property('merged_parameter_validation');
      expect(registerResponseController.merged_parameter_validation).to.have.property('transaction');
      expect(registerResponseController.merged_parameter_validation).to.have.property('processorresponse');

      expect(registerResponseController).to.have.property('merged_parameter_definition');
      expect(registerResponseController.merged_parameter_definition).to.have.property('constructor');
      expect(registerResponseController.merged_parameter_definition['constructor'].optional).to.deep.equal({
        response_type:'response_type',
        transaction:'transaction',
        processorresponse:'processor_response',
        creditcard:'creditcard'
      });

      expect(registerResponseController.parameters.store.processorresponse).to.deep.equal(processor_response);
      expect(registerResponseController.parameters.store.transaction).to.deep.equal(transaction);
      expect(registerResponseController.parameters.store.response_type).to.deep.equal(response_type);

    });

  });

  describe('setTransaction', () => {
    it('successfully sets a transaction', () => {
      let registerResponseController = new RegisterResponseController();
      let transaction = getValidTransaction();

      registerResponseController.setTransaction(transaction);
      expect(registerResponseController.parameters.store.transaction).to.deep.equal(transaction);
    });
  });

  describe('getTransaction', () => {
    it('successfully gets a transaction', () => {
      let registerResponseController = new RegisterResponseController();
      let transaction = getValidTransaction();

      registerResponseController.setTransaction(transaction);
      expect(registerResponseController.getTransaction()).to.deep.equal(transaction);
    });
  });

  describe('setProcessorResponse', () => {
    it('successfully sets a processor response', () => {
      let registerResponseController = new RegisterResponseController();
      let processor_response = getValidProcessorResponse();

      registerResponseController.setProcessorResponse(processor_response);

      du.warning(registerResponseController.parameters.store);
      expect(registerResponseController.parameters.store.processorresponse).to.deep.equal(processor_response);
    });
  });

  describe('getProcessorResponse', () => {
    it('successfully gets a processor response', () => {
      let registerResponseController = new RegisterResponseController();
      let processor_response = getValidProcessorResponse();

      registerResponseController.setProcessorResponse(processor_response);
      expect(registerResponseController.getProcessorResponse()).to.deep.equal(processor_response);
    });
  });

});
