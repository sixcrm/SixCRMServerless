'use strict'
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

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
    })
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

  });

  describe('validateResponse', () => {

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

  describe('handleForwarding', () => {

    xit('successfully handles forwarding', () => {});

  });

  describe('handleFailures', () => {

    xit('successfully handles failures', () => {});

  });

  describe('handleNoAction', () => {

    xit('successfully handles noaction', () => {});

  });

  describe('deleteMessages', () => {

    xit('successfully deletes messages', () => {});

  });

  describe('deleteMessage', () => {

    xit('successfully deletes a message', () => {});

  });

  describe('handleRespose', () => {

    xit('successfully handles response', () => {});

  });

  describe('handleResposes', () => {

    xit('successfully handles responses', () => {});

  });

  describe('execute', () => {

    xit('successful', () => {});

  });

});
