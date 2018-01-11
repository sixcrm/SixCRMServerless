'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id){

  return MockEntities.getValidMessage(id);

}

let rebill_id = null

process.argv.forEach((val, index, array) => {
  if(stringutilities.isMatch(val, /^--rebill=[a-z0-9\-].*$/)){
    rebill_id = val.split('=')[1];
  }
});

describe('controllers/workers/forwardmessage/deliveredToArchive.js', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  beforeEach(() => {
    mockery.resetCache();
    mockery.deregisterAll();
  });

  describe('execute', () => {

    it('successfully updates rebill state and date', () => {

      rebill_id = (!_.isNull(rebill_id))?rebill_id:uuidV4();
      let message = getValidMessage(rebill_id);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        receiveMessages:({queue, limit}) => {
          du.highlight('Message read from queue (mock): '+queue);
          return Promise.resolve([message]);
        },
        sendMessage:({message_body: body, queue: queue}) => {
          du.highlight('Message sent to queue (mock): '+queue);
          return Promise.resolve(true);
        },
        deleteMessage: ({queue, receipt_handle}) => {
          du.highlight('Deleting message from queue: '+queue);
          return Promise.resolve(true);
        }
      });

      const DeliveredToArchiveController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/deliveredToArchive.js');
      let deliveredToArchiveController = new DeliveredToArchiveController();

      return deliveredToArchiveController.execute().then(result => {
        du.info(result);

          let rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');

          return rebillController.get({id: rebill_id}).then((rebill) => {
              du.info(rebill);

            const timeSinceCreation = timestamp.getSecondsDifference(rebill.updated_at);

            expect(rebill.state).to.equal('archived');
            expect(rebill.previous_state).to.equal('delivered');
            expect(timeSinceCreation).to.be.below(10);

          });
      });

    });

  });

});
