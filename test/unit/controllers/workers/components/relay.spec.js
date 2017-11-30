'use strict'

const fs = require('fs');
const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');
const uuidV4 = require('uuid/v4');

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const RelayController = global.SixCRM.routes.include('workers', 'components/relay.js');

function getValidParams(){

  return {
    name: 'somename',
    origin_queue:'test',
    workerfunction: 'someworkerfunction'
  };

}

function getValidMessages(){
  return [
    {
      MessageId: "f0b56385-ff0d-46d9-8faa-328c0f65ad1a",
      ReceiptHandle: "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
      MD5OfBody: "d9e803e2c0e1752dcf57050a2b94f5d9",
      Body: JSON.stringify({id: uuidV4()})
    },
    {
      MessageId: "fa969951-ae5f-4ff9-8b1b-1085a407f0cd",
      ReceiptHandle: "AQEBLc9SRWGv/P/zAExqfkmxxEN2LK7SSeKwz0OyJ5CejQvVC+gBQuvKA0xmq7yC11vwk6jOSaznBTJWILtl1ceayFDYBM9kSLKcnlJlz8/Y5qXuricdeV8LTdPIqFKUeHCr4FLEsT9F1uFDsEduIw6ZTT/2Pya5Y5YaMwY+Uvg1z1UYQ7IcUDHDJk6RGzmoEL42CsSUqIBwxrfKGQ7GkwzJ0Xv4CgAl7Jmd7d44BR2+Y3vgfauSTSVze9ao8tQ71VpsX2dqBfpJK89wpjgtKU7UG/oG/2BeavIirNi9LkzjXXxiHQvrJXSYyREK2J7Eo+iUehctCsNIZYUzF8ubrzOH0NZG80D1ZJZj6vywtE0NQsQT5TbY80ugcDMSNUV8K7IgusvY0p57U7WN1r/GJ40czg==",
      MD5OfBody: "d9e803e2c0e1752dcf57050a2b94f5d9",
      Body: JSON.stringify({id: uuidV4()})
    }
  ];
}

describe('controllers/workers/components/relay.js', function () {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  describe('constructor', () => {

    it('successfully constructs', () => {

      let relayController = new RelayController();

      expect(objectutilities.getClassName(relayController)).to.equal('RelayController');

    });

  });

  describe('getMessages', () => {

    it('successfully gets messages from a queue', () => {

      let messages = getValidMessages();
      let params = getValidParams();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        receiveMessages: ({queue, limit}) => {
          return Promise.resolve(messages);
        }
      });

      let relayController = new RelayController();

      relayController.parameters.set('params', params);


      return relayController.getMessages().then(results => {

        expect(results).to.deep.equal(messages);

      });

    });

    it('successfully gets messages from a custom data source', () => {

        let messages = getValidMessages();
        let datasource = () => { return Promise.resolve(messages); }

        let relayController = new RelayController();

        relayController.message_acquisition_function = datasource;

        return relayController.getMessages().then(results => {

          expect(results).to.deep.equal(messages);

        });

    });

  });

});
