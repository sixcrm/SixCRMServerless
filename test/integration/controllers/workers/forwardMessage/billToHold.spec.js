'use strict'
const _ = require('underscore');
const chai = require("chai");
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mockery = require('mockery');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

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

  describe('execute', () => {

    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    it('successfully executes', () => {

      rebill_id = (!_.isNull(rebill_id)) ? rebill_id : uuidV4();
      let message = getValidMessage(rebill_id);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        receiveMessages: ({queue, limit}) => {
          du.highlight('Message read from queue (mock): ' + queue);
          return Promise.resolve([message]);
        },
        sendMessage: ({message_body: body, queue: queue}) => {
          du.highlight('Message sent to queue (mock): ' + queue);
          return Promise.resolve(true);
        },
        deleteMessage: ({queue, receipt_handle}) => {
          du.highlight('Deleting message from queue: ' + queue);
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

        let lastTransaction = allTransactions.sort((f, s) => {
          if (f.created_at < s.created_at) return 1;

          if (f.created_at > s.created_at) return -1;

          return 0;
        })[0];

        const timeSinceCreation = timestamp.getSecondsDifference(lastTransaction.created_at);

        expect(timeSinceCreation).to.be.below(10);
        expect(lastTransaction.rebill).to.equal(rebill_id);
        expect(lastTransaction.amount).to.equal(rebill.amount);
        expect(lastTransaction.products.length).to.equal(rebill.products.length);

      })
    });

    it('successfuly executes if no messages in queue found', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        receiveMessages: ({queue, limit}) => {
          du.highlight('Message read from queue (mock): ' + queue);
          return Promise.resolve([]);
        }
      });

      const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
      let billToHoldForwardMessageController = new BillToHoldForwardMessageController();

      return billToHoldForwardMessageController.execute().then((result) => {
        du.info(result);

        return true;
      })
    });

    it('fails with error response if non existing rebill is retrieved from sqs', () => {

      let message = getValidMessage();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        receiveMessages:({queue, limit}) => {
          du.highlight('Message read from queue (mock): '+queue);
          return Promise.resolve([message]);
        }
      });

      const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
      let billToHoldForwardMessageController = new BillToHoldForwardMessageController();

      return billToHoldForwardMessageController.execute().then((result) => {
        expect(result.response.code).to.equal('error');
      })

    });

    it('properly handles error if happens in Process.js', () => {

      rebill_id = (!_.isNull(rebill_id)) ? rebill_id : uuidV4();
      let message = getValidMessage(rebill_id);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        receiveMessages: ({queue, limit}) => {
          return Promise.resolve([message]);
        },
        sendMessage: ({message_body: body, queue: queue}) => {
          expect(queue).to.equal('bill_error');
          expect(JSON.parse(body).additional_information).to.equal('[500] Some error in Process.js');
          return Promise.resolve(true);
        },
        deleteMessage: ({queue, receipt_handle}) => {
          expect(queue).to.equal('bill');
          return Promise.resolve(true);
        }
      });

      let process_mock = class {
        constructor(){ }

        process(argument_object){
          eu.throwError('server', 'Some error in Process.js');
        }

      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Process.js'), process_mock);

      const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
      let billToHoldForwardMessageController = new BillToHoldForwardMessageController();

      return billToHoldForwardMessageController.execute().then((result) => {
        console.log(result);
        expect(result.response.code).to.equal('success');
      })

    });

    it('does not execute register and moves message to error queue if rebill is not billable due to billed at date', () => {

      let rebill = MockEntities.getValidRebill();
      let session = MockEntities.getValidSession(rebill.parentsession);
      let schedules = [MockEntities.getValidProductSchedule(rebill.product_schedules[0])];

      let message = getValidMessage(rebill.id);

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        receiveMessages: ({queue, limit}) => {
          return Promise.resolve([message]);
        },
        sendMessage: ({message_body: body, queue: queue}) => {
          expect(queue).to.equal('bill_error');
          return Promise.resolve(true);
        },
        deleteMessage: ({queue, receipt_handle}) => {
          expect(queue).to.equal('bill');
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get: ({id}) => {
          rebill.bill_at = timestamp.toISO8601(timestamp.createTimestampSeconds() + timestamp.getDayInSeconds());
          return Promise.resolve(rebill);
        },
        getParentSession: ({id}) => {
          return Promise.resolve(session);
        },
        listProductSchedules: ({id}) => {
          return Promise.resolve(schedules);
        }
      });


      let rebill_helper_mock = class {
        constructor(){ }

        updateRebillState({rebill, new_state, previous_state}){
          expect(new_state).to.equal('bill_error');
          expect(previous_state).to.equal('bill');
          return Promise.resolve(rebill);
        }

      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), rebill_helper_mock);

      let process_mock = class {
        constructor(){ }

        process(argument_object){ expect.fail() }

      };

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'transaction/Process.js'), process_mock);

      const BillToHoldForwardMessageController = global.SixCRM.routes.include('controllers', 'workers/forwardMessage/billToHold.js');
      let billToHoldForwardMessageController = new BillToHoldForwardMessageController();

      return billToHoldForwardMessageController.execute().then((result) => {
        expect(result.response.code).to.equal('success');
      })

    });

  });

});
