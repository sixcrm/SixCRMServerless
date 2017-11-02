'use strict'
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const WorkerResponse = global.SixCRM.routes.include('workers', 'WorkerResponse.js');

function getValidCompoundWorkerResponse(response, message){

  return {worker_response_object: getValidWorkerResponse(response), message: message};

}

function getValidMessage(){

  return getValidMessages().pop();

}

function getValidWorkerResponse(response){

  return new WorkerResponse(response);

}

function getValidMockWorker(){

  let WorkerResponse = global.SixCRM.routes.include('workers', 'WorkerResponse.js');
  class aWorker {
    constructor(){

    }
    execute(message){
      return Promise.resolve(new WorkerResponse('success'));
    }
  }

  return new aWorker();

}

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

  describe('validateEnvironment', () => {

    it('fails when origin queue is not set.', () => {

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      try{

        forwardMessageController.validateEnvironment()

      }catch(error){

        expect(error.message).to.equal('[500] One or more validation errors occurred.');

      };

    });

    it('fails when name is not set.', () => {

      process.env.origin_queue = 'dummy_queue';

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      try{

        forwardMessageController.validateEnvironment()

      }catch(error){

        expect(error.message).to.equal('[500] One or more validation errors occurred.');

      };

    });

    it('fails when workerfunction is not set.', () => {

      process.env.origin_queue = 'dummy_queue';
      process.env.name = 'dummy_name';

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      try{

        forwardMessageController.validateEnvironment()

      }catch(error){

        expect(error.message).to.equal('[500] One or more validation errors occurred.');

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

  describe('forwardMessagesToWorkers', () => {

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

      let mock_worker = getValidMockWorker();
      mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);
      process.env.workerfunction = 'aWorker.js';

      let forwardMessageController = global.SixCRM.routes.include('workers', 'forwardMessage.js');

      let messages = [];

      return forwardMessageController.forwardMessagesToWorkers(messages).then(messages => {
        delete process.env.workerfunction;
        expect(messages).to.deep.equal([]);
      });

    });

    it('succeeds for valid messages of length less than limit', () => {

      let mock_worker = getValidMockWorker();
      mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);
      process.env.workerfunction = 'aWorker.js';

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = getValidMessages();

      return forwardMessageController.forwardMessagesToWorkers(messages).then(responses => {

        expect(responses.length).to.equal(messages.length);

        arrayutilities.map(responses, response => {

          expect(response).to.have.property('worker_response_object');
          expect(response.worker_response_object).to.have.property('response');
          expect(response.worker_response_object.response).to.have.property('code');
          expect(response.worker_response_object.response.code).to.equal('success');
          expect(response).to.have.property('message');
          expect(response.message).to.have.property('ReceiptHandle');

        });

      });

    });

    it('succeeds for valid messages of length equal to limit', () => {

      let mock_worker = getValidMockWorker();
      mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);
      process.env.workerfunction = 'aWorker.js';

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = arrayutilities.merge(getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages());

      return forwardMessageController.forwardMessagesToWorkers(messages).then(responses => {

        expect(responses.length).to.equal(messages.length);
        arrayutilities.map(responses, response => {

          expect(response).to.have.property('worker_response_object');
          expect(response.worker_response_object).to.have.property('response');
          expect(response.worker_response_object.response).to.have.property('code');
          expect(response.worker_response_object.response.code).to.equal('success');
          expect(response).to.have.property('message');
          expect(response.message).to.have.property('ReceiptHandle');

        });

      });

    });

    //Technical Debt:  Throw an error, see what happens
    xit('handles errors', () => {

      let mock_worker = getValidMockWorker();
      mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);
      process.env.workerfunction = 'aWorker.js';

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = getValidMessages();

      return forwardMessageController.forwardMessagesToWorkers(messages).then(responses => {

        arrayutilities.map(responses, response => {

          expect(response).to.have.property('worker_response_object');
          expect(response.worker_response_object).to.have.property('response');
          expect(response.worker_response_object.response).to.have.property('code');
          expect(response.worker_response_object.response.code).to.equal('success');
          expect(response).to.have.property('message');
          expect(response.message).to.have.property('ReceiptHandle');

        });

      });

    });

    it('succeeds for when bulk is set', () => {

      let mock_worker = getValidMockWorker();
      mockery.registerMock(global.SixCRM.routes.path('workers', 'aWorker.js'), mock_worker);
      process.env.workerfunction = 'aWorker.js';

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let messages = arrayutilities.merge(getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages(), getValidMessages());

      process.env.bulk = true;

      return forwardMessageController.forwardMessagesToWorkers(messages).then(responses => {

        expect(responses.length).to.equal(1);

        arrayutilities.map(responses, response => {

          expect(response).to.have.property('worker_response_object');
          expect(response.worker_response_object).to.have.property('response');
          expect(response.worker_response_object.response).to.have.property('code');
          expect(response.worker_response_object.response.code).to.equal('success');
          expect(response).to.have.property('messages');
          expect(response.messages.length).to.equal(messages.length);

          arrayutilities.map(response.messages, response_message => {
            expect(response_message).to.have.property('ReceiptHandle');
          })

        });

      });

    });

  });

  describe('respond', () => {

    //make sure the response has the original message in the body
    it('responds correctly when there are no messages', () => {

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      let RelayResponse = global.SixCRM.routes.include('workers', 'RelayResponse.js');
      let relay_response = new RelayResponse('success');

      let response = forwardMessageController.respond('success');

      expect(response).to.deep.equal(relay_response);

    });

  });

  describe('handleFailure', () => {

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

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body, queue}, callback) => {
          throw new Error();
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleFailure(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

    it('does not foward when process.env.failure_queue property is not set', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body, queue}, callback) => {
          throw new Error();
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('fail', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleFailure(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

    it('succesfully fowards to failure queue', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body, queue}, callback) => {
          console.log('Forwarding to queue: '+queue);
          return callback(null, true);
        }
      });

      process.env.failure_queue = 'some_queue';

      let compoundWorkerResponse = getValidCompoundWorkerResponse('fail', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleFailure(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

  });

  describe('handleSuccess', () => {

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

    it('does not foward a object missing the success property', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body, queue}, callback) => {
          throw new Error();
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('fail', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleSuccess(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

    it('does not foward when process.env.destination_queue property is not set', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body, queue}, callback) => {
          throw new Error();
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleSuccess(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

    it('succesfully fowards to destination queue', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body, queue}, callback) => {
          console.log('Forwarding to queue: '+queue);
          return callback(null, true);
        }
      });

      process.env.failure_queue = 'some_queue';

      let compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleSuccess(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

  });

  describe('handleError', () => {

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

    it('does not foward a object missing the error property', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body, queue}, callback) => {
          throw new Error();
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleError(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

    it('does not foward when process.env.error_queue property is not set', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body, queue}, callback) => {
          throw new Error();
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('error', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleError(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

    it('succesfully fowards to error queue', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body, queue}, callback) => {
          console.log('Forwarding to queue: '+queue);
          return callback(null, true);
        }
      });

      process.env.error_queue = 'some_queue';

      let compoundWorkerResponse = getValidCompoundWorkerResponse('error', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleError(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

  });


  describe('handleNoAction', () => {

    it('does not foward a object missing the noaction property', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage: ({message_body, queue}, callback) => {
          throw new Error();
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleNoAction(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

    it('successfully handles noaction', () => {

      let compoundWorkerResponse = getValidCompoundWorkerResponse('noaction', getValidMessage());

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleNoAction(compoundWorkerResponse).then(response_object => {
        expect(response_object).to.deep.equal(compoundWorkerResponse);
      });

    });

  });

  describe('handleDelete', () => {

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

    it('does not delete noaction type', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        deleteMessage: ({queue, receipt_handle}) => {
          throw new Error();
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('noaction', getValidMessage());
      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
        expect(returned).to.deep.equal(compoundWorkerResponse);
      });

    });

    it('successfully deletes fail type', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        deleteMessage: ({queue, receipt_handle}) => {
          du.warning('mock delete executed');
          return Promise.resolve(true);
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('fail', getValidMessage());
      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
        expect(returned).to.deep.equal(compoundWorkerResponse);
      });

    });

    it('successfully deletes success type', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        deleteMessage: ({queue, receipt_handle}) => {
          du.warning('mock delete executed');
          return Promise.resolve(true);
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('success', getValidMessage());
      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
        expect(returned).to.deep.equal(compoundWorkerResponse);
      });

    });

    it('successfully deletes error type', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        deleteMessage: ({queue, receipt_handle}) => {
          du.warning('mock delete executed');
          return Promise.resolve(true);
        }
      });

      let compoundWorkerResponse = getValidCompoundWorkerResponse('error', getValidMessage());
      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      return forwardMessageController.handleDelete(compoundWorkerResponse).then(returned => {
        expect(returned).to.deep.equal(compoundWorkerResponse);
      });

    });

  });

  describe('handleWorkerResponseObject', () => {

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

    it('successfully handles a worker response', () => {

      let compound_worker_response_object = getValidCompoundWorkerResponse('success', getValidMessage())

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        deleteMessage: ({queue, receipt_handle}) => {
          return Promise.resolve(true);
        }
      });

      let forwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage.js');

      forwardMessageController.handleWorkerResponseObject(compound_worker_response_object).then(result => {

        expect(result).to.equal(compound_worker_response_object);

      });

    });

  });

  describe('execute', () => {

    xit('successful', () => {});

  });

  //technical debt:  Create a response object for worker controllers

});
