'use strict'
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

function getValidMessages(){
  return [
    {
      "MessageId": "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
      "ReceiptHandle": "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
      "MD5OfBody": "d9e803e2c0e1752dcf57050a2b94f5d9",
      "Body": "abc123"
    },
    {
      "MessageId": "fa969951-ae5f-4ff9-8b1b-1085a407f0cd",
      "ReceiptHandle": "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
      "MD5OfBody": "d9e803e2c0e1752dcf57050a2b94f5d9",
      "Body": "xyz789"
    }
  ];
}

function getValidLambdaResponse(){
  return {
    StatusCode: 200,
    Payload:JSON.stringify({
      statusCode:200,
      body: JSON.stringify('some response')
    }),
    LogResult: 'Some string'
  }
}

function getValidLambdaResponseError(){
  return {
    StatusCode: 500,
    Payload:JSON.stringify({
      statusCode:200,
      body: JSON.stringify('some response')
    })
  }
}

function getValidForwardMessage(){

  return {
    message: getValidMessages().shift(),
    response: {
      statusCode:200,
      body: JSON.stringify('some response')
    },
    error:null
  };

}

function getValidWorkerLambdaResponse(){

  return {
    statusCode: 200,
    headers: {},
    body:JSON.stringify({this: 'Is some body!'})
  };

}

function getValidWorkerControllerResponse(){

  return {
    message:'message',
    forward: 'forward',
    failed:'failed'
  };

}



function getInvokeError(){
  let error = new Error();

  error.message = 'Test Error';
  return error;
}

describe('workers/forwardMessage', () => {

  describe('validateRequest', () => {

    it('fails when origin queue is not set.', () => {

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      try{

        forwardMessageController.validateRequest()

      }catch(error){

        expect(error.message).to.equal('[500] Expected object to have key "origin_queue"');

      };

    });

    it('fails when name is not set.', () => {

      process.env.origin_queue = 'dummy_queue';

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      try{

        forwardMessageController.validateRequest()

      }catch(error){

        expect(error.message).to.equal('[500] Expected object to have key "name"');

      };

    });

    it('fails when workerfunction is not set.', () => {

      process.env.origin_queue = 'dummy_queue';
      process.env.name = 'dummy_name';

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      try{

        forwardMessageController.validateRequest()

      }catch(error){

        expect(error.message).to.equal('[500] Expected object to have key "workerfunction"');

      };

    });

  });

  describe('getMessages', () => {

    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    beforeEach(() => {
      global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    it('successfully retrieves messages', () => {

      process.env.origin_queue = 'dummy_queue';

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        receiveMessages: ({queue, limit}) => {
          let messages = getValidMessages();

          return Promise.resolve(messages);
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.getMessages().then((messages) => {
        expect(messages).to.deep.equal(getValidMessages());
      });

    });

  });

  describe('validateMessages', () => {

    it('fails for invalid message container types', () => {

      let invalids = [{}, '', null, undefined, 123, new Error(), false, true];

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      arrayutilities.map(invalids, (invalid) => {

        try{

          forwardMessageController.validateMessages(invalid);

        }catch(error){

          expect(error.message).to.exist;

        }

      });

    });

    it('fails for invalid messages', () => {


      let valid_messages = getValidMessages();
      let invalids = [
        {},
        {
          "ReceiptHandle": "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
          "MD5OfBody": "d9e803e2c0e1752dcf57050a2b94f5d9",
          "Body": "abc123"
        },
        {
          "MessageId": "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
          "MD5OfBody": "d9e803e2c0e1752dcf57050a2b94f5d9",
          "Body": "abc123"
        },
        {
          "MessageId": "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
          "ReceiptHandle": "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
          "Body": "abc123"
        },
        {
          "MessageId": "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
          "ReceiptHandle": "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
          "MD5OfBody": "d9e803e2c0e1752dcf57050a2b94f5d9"
        }
      ];

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      arrayutilities.map(invalids, (invalid) => {

        invalid = arrayutilities.merge(valid_messages, [invalid]);

        try{

          forwardMessageController.validateMessages(invalid);

        }catch(error){

          expect(error.message).to.exist;

        }

      });

    });

    it('succeeds for valid messages', () => {

      let valids = [getValidMessages(), []];

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      arrayutilities.map(valids, valid => {

        forwardMessageController.validateMessages(valid).then(validated_messages => {
          expect(validated_messages).to.deep.equal(valid);
        })

      });

    });

  });

  describe('invokeAdditionalLambdas', () => {

    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    beforeEach(() => {
      global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    it('succeeds for valid messages of length less than limit', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'lambda-utilities.js'), {
        invokeFunction: () => {
          return true;
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = getValidMessages();

      return forwardMessageController.invokeAdditionalLambdas(messages).then((messages) => {
        expect(messages).to.deep.equal(getValidMessages());
      });

    });

    it('succeeds for valid messages of length 0', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'lambda-utilities.js'), {
        invokeFunction: () => {
          return true;
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = [];

      return forwardMessageController.invokeAdditionalLambdas(messages).then((messages) => {
        expect(messages).to.deep.equal([]);
      });

    });

    it('succeeds for valid messages of length 10', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'lambda-utilities.js'), {
        invokeFunction: () => {
          return true;
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = arrayutilities.merge(getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages());

      return forwardMessageController.invokeAdditionalLambdas(messages).then((messages) => {
        expect(messages).to.deep.equal(messages);
      });

    });

    it('fails when lambda returns error', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'lambda-utilities.js'), {
        invokeFunction: () => {
          let error = new Error();

          error.message = 'Testing Error.';
          return Promise.reject(error);
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.invokeAdditionalLambdas([]).catch(error => {
        expect(error.message).to.equal('Testing Error.');
      });

    });

  });

  describe('forwardMessages', () => {

    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    beforeEach(() => {
      global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    it('succeeds for valid messages of length 0', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'lambda-utilities.js'), {
        invokeFunction: () => {
          return Promise.resolve('')
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = [];

      return forwardMessageController.forwardMessages(messages).then(messages => {
        expect(messages).to.deep.equal([]);
      });

    });

    it('succeeds for valid messages of length less than limit', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'lambda-utilities.js'), {
        invokeFunction: (parameters) => {
          return Promise.resolve(getValidLambdaResponse());
        },
        buildLambdaName: (shortname) => {
          return 'alambdaname';
        }

      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = getValidMessages();

      return forwardMessageController.forwardMessages(messages).then(responses => {

        expect(responses.length).to.equal(messages.length);
        arrayutilities.map(responses, response => {
          expect(response).to.have.property('message');
          expect(response).to.have.property('response');
        });

      });

    });

    it('succeeds for valid messages of length equal to limit', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'lambda-utilities.js'), {
        invokeFunction: (parameters, callback) => {
          return Promise.resolve(getValidLambdaResponse());
        },
        buildLambdaName: (shortname) => {
          return 'alambdaname';
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = arrayutilities.merge(getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages());

      return forwardMessageController.forwardMessages(messages).then(responses => {

        expect(responses.length).to.equal(messages.length);
        arrayutilities.map(responses, response => {
          expect(response).to.have.property('message');
          expect(response).to.have.property('response');
        });

      });

    });

    it('handles errors', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'lambda-utilities.js'), {
        invokeFunction: (parameters, callback) => {
          return Promise.resolve(getInvokeError());
        },
        buildLambdaName: (shortname) => {
          return 'alambdaname';
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = getValidMessages();

      return forwardMessageController.forwardMessages(messages).then(responses => {

        arrayutilities.map(responses, response => {

          du.info(response);

          expect(response).to.have.property('response');
          expect(response).to.have.property('message');
          expect(response).to.have.property('error');
          expect(response.response).to.equal(null);
          expect(response.error instanceof Error).to.equal(true);

        });

      });

    });

    it('succeeds for when bulk is set', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'lambda-utilities.js'), {
        invokeFunction: (parameters, callback) => {
          return Promise.resolve(getValidLambdaResponse());
        },
        buildLambdaName: (shortname) => {
          return 'alambdaname';
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = arrayutilities.merge(getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages());

      process.env.bulk = true;

      return forwardMessageController.forwardMessages(messages).then(responses => {

        expect(responses.length).to.equal(1);

        arrayutilities.map(responses, response => {
          expect(response).to.have.property('response');
          expect(response).to.have.property('message');
          expect(response.message.length).to.equal(messages.length);
        });

      });

    });

  });

  describe('validateForwardMessage', () => {

    it('successfully validates a response', () => {

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let response = getValidForwardMessage();

      forwardMessageController.validateForwardMessage(response).then(valid_response => {
        expect(valid_response).to.deep.equal(response);
      });

    });

    it('fails to validate responses', () => {

      let response = getValidForwardMessage();

      let invalid_responses = [{}, null, 123, 'abc', new Error, [], () => {}];

      let a_invalid_response = objectutilities.clone(response);

      delete a_invalid_response.message
      invalid_responses.push(a_invalid_response);

      a_invalid_response = objectutilities.clone(response);
      delete a_invalid_response.response
      invalid_responses.push(a_invalid_response);

      a_invalid_response = objectutilities.clone(response);
      delete a_invalid_response.message
      invalid_responses.push(a_invalid_response);

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      arrayutilities.map(invalid_responses, (invalid_response) => {
        try{
          forwardMessageController.validateForwardMessage(invalid_response);
        }catch(error){
          expect(error.message).to.equal('[500] One or more validation errors occurred.');
        }

      });

    });

  });

  describe('respond', () => {

    it('responds correctly when there are no messages', () => {

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let response = forwardMessageController.respond([]);

      expect(response).to.deep.equal([]);

    });

  });

  describe('assembleForwardMessageResponseObject', () => {

    it('correctly assembles a forward message object', () => {

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let response = {};
      let message = {};
      let error = new Error();

      let forward_message_response = forwardMessageController.assembleForwardMessageResponseObject(response, message, error);

      expect(forward_message_response).to.have.property('response');
      expect(forward_message_response).to.have.property('error');
      expect(forward_message_response).to.have.property('message');
      expect(forward_message_response.response).to.deep.equal(response);
      expect(forward_message_response.message).to.deep.equal(message);
      expect(forward_message_response.error).to.deep.equal(error);

    });

  });

  describe('validateLambdaResponse', () => {

    it('fails to validate invalid Lambda Responses', () => {

      let response = getValidLambdaResponse();

      let invalid_responses = [{}, null, 123, 'abc', new Error, [], () => {}];

      let a_invalid_response = objectutilities.clone(response);

      delete a_invalid_response.StatusCode
      invalid_responses.push(a_invalid_response);

      a_invalid_response = objectutilities.clone(response);
      delete a_invalid_response.Payload
      invalid_responses.push(a_invalid_response);

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      arrayutilities.map(invalid_responses, (invalid_response) => {

        try{
          forwardMessageController.validateLambdaResponse(invalid_response);
        }catch(error){
          expect(error.message).to.equal('[500] One or more validation errors occurred.');
        }

      });

    });

    it('successfully validates a Lambda Responses', () => {

      let response = getValidLambdaResponse();

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      forwardMessageController.validateLambdaResponse(response).then(valid_response => {

        expect(valid_response).to.deep.equal(response);

      });

    });

  });

  describe('validateWorkerLambdaResponse', () => {

    it('fails to validate invalid ', () => {

      let response = getValidWorkerLambdaResponse();

      let invalid_responses = [{}, null, 123, 'abc', new Error, [], () => {}];

      let a_invalid_response = objectutilities.clone(response);

      delete a_invalid_response.StatusCode
      invalid_responses.push(a_invalid_response);

      a_invalid_response = objectutilities.clone(response);
      delete a_invalid_response.Payload
      invalid_responses.push(a_invalid_response);

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      arrayutilities.map(invalid_responses, (invalid_response) => {

        try{
          forwardMessageController.validateWorkerLambdaResponse(invalid_response);
        }catch(error){
          expect(error.message).to.equal('[500] One or more validation errors occurred.');
        }

      });

    });

    it('successfully validates a worker lambda response ', () => {

      let response = getValidWorkerLambdaResponse();

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      forwardMessageController.validateWorkerLambdaResponse(response).then(validated_response => {
        expect(validated_response).to.deep.equal(response);
      });

    });

  });

  describe('validateWorkerControllerResponse', () => {

    it('fails to validate invalid response', () => {

      let response = getValidWorkerControllerResponse();

      let invalid_responses = [{}, null, 123, 'abc', new Error, [], () => {}];

      let a_invalid_response = objectutilities.clone(response);

      delete a_invalid_response.message
      invalid_responses.push(a_invalid_response);

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      arrayutilities.map(invalid_responses, (invalid_response) => {

        try{
          forwardMessageController.validateWorkerControllerResponse(invalid_response);
        }catch(error){
          expect(error.message).to.equal('[500] One or more validation errors occurred.');
        }

      });

    });

    it('successfully validates a worker controller response ', () => {

      let response = getValidWorkerControllerResponse();

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      forwardMessageController.validateWorkerControllerResponse(response).then(validated_response => {
        expect(validated_response).to.deep.equal(response);
      });

    });

  });

  describe('parseLambdaResponsePayload', () => {

    it('successfully parses a JSON string', () => {

      let lambda_response = getValidLambdaResponse();

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let payload = forwardMessageController.parseLambdaResponsePayload(lambda_response);

      expect(payload).to.deep.equal(JSON.parse(lambda_response.Payload));

    });

    it('successfully passes a object on', () => {

      let lambda_response = getValidLambdaResponse();

      lambda_response.Payload = JSON.parse(lambda_response.Payload);

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let payload = forwardMessageController.parseLambdaResponsePayload(lambda_response);

      expect(payload).to.deep.equal(lambda_response.Payload);

    });

  });

  describe('parseWorkerLambdaResponse(', () => {

    it('successfully parses a JSON string', () => {

      let worker_lambda_response = getValidWorkerLambdaResponse();

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let parsed_body = forwardMessageController.parseWorkerLambdaResponseBody(worker_lambda_response);

      expect(parsed_body).to.deep.equal(JSON.parse(worker_lambda_response.body));

    });

    it('successfully passes a object on', () => {

      let worker_lambda_response = getValidWorkerLambdaResponse();

      worker_lambda_response.body = JSON.parse(worker_lambda_response.body);

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let parsed_body = forwardMessageController.parseWorkerLambdaResponseBody(worker_lambda_response);

      expect(parsed_body).to.deep.equal(worker_lambda_response.body);

    });

  });

  describe('handleForwarding', () => {

    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    beforeEach(() => {
      global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    it('does not foward a object missing the forward property', () => {

      let missing_forward = {};

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleForwarding(missing_forward).then(returned_missing_forward => {
        expect(returned_missing_forward).to.deep.equal(missing_forward);
      });

    });

    it('does not foward process.env.destination_queue property is not set', () => {

      let has_forward = {
        forward: 'some_message'
      };

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleForwarding(has_forward).then(returned_has_forward => {
        expect(returned_has_forward).to.deep.equal(has_forward);
      });

    });

    it('marks the object with "SUCCESS"', () => {

      let has_forward = {
        forward: 'some_message'
      };

      process.env.destination_queue = 'some_queue';

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body: body, queue: queue}, callback) => {
          return callback(null, {});
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleForwarding(has_forward).then(returned_has_forward => {
        expect(returned_has_forward).to.have.property('result');
        expect(returned_has_forward.result).to.equal(forwardMessageController.messages.success);
      });

    });

  });

  describe('handleFailures', () => {

    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    beforeEach(() => {
      global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    it('does not foward a object missing the failure property', () => {

      let missing_failure = {};

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleFailures(missing_failure).then(returned_missing_failure => {
        expect(returned_missing_failure).to.deep.equal(missing_failure);
      });

    });

    it('does not foward when process.env.failure_queue property is not set', () => {

      let has_failure = {
        failed: 'some_message'
      };

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleFailures(has_failure).then(returned_has_failure => {
        expect(returned_has_failure).to.deep.equal(has_failure);
      });

    });

    it('marks the object with "FAILFORWARD"', () => {

      let has_failure = {
        failed: 'some_message'
      };

      process.env.failure_queue = 'some_queue';

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body: body, queue: queue}, callback) => {
          return callback(null, {});
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleFailures(has_failure).then(returned_has_failure => {
        expect(returned_has_failure).to.have.property('result');
        expect(returned_has_failure.result).to.equal(forwardMessageController.messages.failforward);
      });

    });

  });

  describe('handleNoAction', () => {

    it('successfully handles noaction', () => {

      let no_result = {};

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleNoAction(no_result).then(returned => {
        expect(returned).to.have.property('result');
        expect(returned.result).to.equal(forwardMessageController.messages.successnoaction);
      });

    });

    it('successfully skips noaction', () => {

      let no_result = {
        result:'Already Set'
      };

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleNoAction(no_result).then(returned => {
        expect(returned).to.have.property('result');
        expect(returned.result).to.equal(no_result.result);
      });

    });

  });

  describe('deleteMessage', () => {

    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    beforeEach(() => {
      global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    it('successfully deletes a message', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        deleteMessage: ({queue: queue, receipt_handle: receipt_handle}) => {
          return Promise.resolve(receipt_handle);
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let deletethis = {
        result: forwardMessageController.messages.success,

      };

      let message_receipt_handle = 'abc123'

      return forwardMessageController.deleteMessage(deletethis, message_receipt_handle).then(returned => {

        expect(returned).to.deep.equal(deletethis);

      });

    });

  });

  describe('handleRespose', () => {

    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    beforeEach(() => {
      global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    xit('successfully handles response', () => {

      let forward_message = getValidForwardMessage();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        deleteMessage: ({queue: queue, receipt_handle: receipt_handle}) => {
          return Promise.resolve(receipt_handle);
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      forwardMessageController.handleResponse(forward_message).then(result => {

        expect(true).to.equal(true);

      });

    });

  });

  describe('execute', () => {

    xit('successful', () => {});

  });

  //technical debt:  Create a response object for worker controllers

});
