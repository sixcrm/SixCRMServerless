'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMessage(id){

  return MockEntities.getValidMessage(id);

}

let rebill_id = null;

process.argv.forEach((val, index, array) => {
  if(stringutilities.isMatch(val, /^--rebill=[a-z0-9\-].*$/)){
    rebill_id = val.split('=')[1];
  }
});

describe('controllers/workers/forwardmessage/billToHoldForwardMessage.js', () => {

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

    it('successfully executes', () => {

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

      let rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
      const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
      let billToHoldForwardMessageController = new BillToHoldForwardMessageController();

      return billToHoldForwardMessageController.execute().then((result) => {
        du.info(result);

        return true;
      }).then(() => {

        return rebillController.get({id: rebill_id})

      }).then((rebill) => {

        expect(rebill.state).to.equal('hold');
        expect(rebill.previous_state).to.equal('bill');

        return rebillController.listTransactions(rebill)
          .then((transactions) => {
            return {rebill: rebill, transactions: transactions}
          });

      }).then(({rebill, transactions}) => {

        const allTransactions = transactions.transactions;

        let lastTransaction = allTransactions.sort((f,s) => {
          if (f.created_at < s.created_at) return 1;

          if (f.created_at > s.created_at) return -1;

          return 0;
        })[0];

        const timeSinceCreation = timestamp.getSecondsDifference(lastTransaction.created_at);

        expect(timeSinceCreation).to.be.below(10);
        expect(lastTransaction.rebill).to.equal(rebill_id);
        expect(lastTransaction.amount).to.equal(rebill.amount);
        expect(lastTransaction.products.length).to.equal(rebill.products.length);

      });

    });

  });

});
