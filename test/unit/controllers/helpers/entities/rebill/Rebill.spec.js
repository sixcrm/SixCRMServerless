'use strict'
const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

function getValidTransactions(){

  return [getValidTransaction(), getValidTransaction()];

}

function getValidTransaction(id){

  return MockEntities.getValidTransaction(id)

}

function getValidShippingReceipts(){
  return [getValidShippingReceipt(),getValidShippingReceipt()];
}

function getValidShippingReceipt(){

  return MockEntities.getValidShippingReceipt();

}

function getValidQueueMessageBodyPrototype(){

  return JSON.stringify({id: uuidV4()});

}

function getValidRebill(id){

  return MockEntities.getValidRebill(id);

  /*
    parentsession: uuidV4(),
    bill_at: '2017-04-06T18:40:41.405Z',
    amount: 12.22,
    product_schedules:
     [ uuidV4(),
       uuidV4(),
       uuidV4() ],
    products:
     [ { product: uuidV4(),
         amount: 3.22 },
       { product: uuidV4(), amount: 9 } ],
    id: uuidV4(),
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    created_at: '2017-11-12T06:03:35.571Z',
    updated_at: '2017-11-12T06:03:35.571Z',
    entity_type: 'rebill',
    state: 'hold',
    previous_state: 'bill',
    state_changed_at: '2017-11-12T06:05:35.571Z',
    history: [
      {
        state: 'bill',
        entered_at: '2017-11-12T06:03:35.571Z',
        exited_at: '2017-11-12T06:05:35.571Z',
      },
      {
        state: 'hold',
        entered_at: '2017-11-12T06:05:35.571Z',
      }
    ]
  };
  */

}

function getValidRebillWithNoState(id){

  let rebill = getValidRebill(id);

  delete rebill.history;
  delete rebill.state;
  delete rebill.previous_state;
  delete rebill.state_changed_at;

  return rebill;

}

function getValidSession(id){

  return MockEntities.getValidSession(id)

}

function getValidProductSchedule(id){

  return MockEntities.getValidProductSchedule(id);

}

function getValidProductSchedules(ids){

  ids = (!_.isUndefined(ids) && !_.isNull(ids))?ids:[uuidV4(),uuidV4()];

  return arrayutilities.map(ids, id => getValidProductSchedule(id));

}

function getValidProductScheduleIDs(){

  return arrayutilities.map(getValidProductSchedules(), product_schedule => {
    return product_schedule.id;
  });

}

describe('/helpers/entities/Rebill.js', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  beforeEach(() => {
    //global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
    mockery.resetCache();
    mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('successfully calls the constructor', () => {
      let rebillHelper = new RebillHelperController();

      expect(objectutilities.getClassName(rebillHelper)).to.equal('RebillHelper');
    });

  });

  describe('setParameters', () => {

    it('successfully sets required parameters', () => {

      //required
      let rebill = getValidRebill();

      let rebillHelper = new RebillHelperController();

      return rebillHelper.setParameters({argumentation: {rebill: rebill}, action: 'getShippingReceipts'}).then(() => {

        return expect(rebillHelper.parameters.store['rebill']).to.equal(rebill);

      });

    });

    xit('successfully sets optional parameters', () => {

      //required
      let session = getValidSession();

      let day = 2;

      let product_schedules = getValidProductScheduleIDs();

      let rebillHelper = new RebillHelperController();

      return rebillHelper.setParameters({argumentation: {session: session, day: day, product_schedules: product_schedules}, action: 'createRebill'}).then(() => {

        expect(rebillHelper.parameters.store['session']).to.equal(session);
        expect(rebillHelper.parameters.store['day']).to.equal(day);
        return expect(rebillHelper.parameters.store['productscheduleids']).to.equal(product_schedules);

      });

    });

  });

  describe('updateRebillState', () => {

    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false
      });
    });

    beforeEach(() => {
      //global.SixCRM.localcache.clear('all');
    });

    afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
    });

    it('throws an error when new state is not defined', () => {
      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update: () => {
          expect.fail();
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: () => {
          expect.fail();
        }
      });

      const rebillHelper = new RebillHelperController();
      const rebill = {id: 'SOME_REBILL_ID', some_other_field: 'SOME_OTHER_FIELD'};

      return rebillHelper.updateRebillState({rebill: rebill, previous_state: 'bill'})
        .catch((error) => expect(error.message).to.have.string('[500] Missing source object field: "new_state".'))
    });

    it('throws an error when updating to unknown state', () => {
      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update: ({entity}) => {
          return Promise.resolve(entity);
        },
        get: () => {
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: () => {
          expect.fail();
        }
      });

      const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      const rebillHelper = new RebillHelper();
      const rebill = getValidRebill();

      return rebillHelper.updateRebillState({rebill: rebill, new_state: 'unknown'})
        .then(() => expect.fail('Error not thrown'))
        .catch((error) => expect(error.message).to.have.string('[500] One or more validation errors occurred: State Name instance does not match pattern "^(bill|recover|hold|pending|shipped|delivered|archived)(_error|_failed|_deadletter)*$"'))
    });

    it('updates rebill state when when rebill has no state (initial state)', () => {
      const rebill = getValidRebillWithNoState();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update: ({entity}) => {
          return Promise.resolve(entity);
        },
        get: () => {
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          expect(table).to.equal('rebills');
          expect(object.id_rebill).to.equal(rebill.id);
          expect(object.current_queuename).to.equal('hold');
          expect(object.previous_queuename).to.equal('');

          mvu.validateModel(object, global.SixCRM.routes.path('model','aurora/rebills.json'));

          return Promise.resolve();
        }
      });

      const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      const rebillHelper = new RebillHelper();

      return rebillHelper.updateRebillState({rebill: rebill, new_state: 'hold'})
        .then((rebill) => {
          expect(rebill.previous_state).to.equal(undefined);
          expect(rebill.state).to.equal('hold');
          expect(rebill.history.length).to.equal(1);
          expect(rebill.history[0].state).to.equal('hold');
          expect(rebill.history[0].entered_at).to.equal(rebill.state_changed_at);
          return expect(rebill.history[0].exited_at).to.equal(undefined);
        })
    });

    it('updates previous state when when rebill state', () => {
      const rebill = getValidRebillWithNoState();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update: ({entity}) => {
          return Promise.resolve(entity);
        },
        get: () => {
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          expect(table).to.equal('rebills');
          expect(object.id_rebill).to.equal(rebill.id);
          expect(object.current_queuename).to.equal('shipped');
          expect(object.previous_queuename).to.equal('hold');

          mvu.validateModel(object, global.SixCRM.routes.path('model','aurora/rebills.json'));

          return Promise.resolve();
        }
      });

      const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      const rebillHelper = new RebillHelper();

      rebill.state = 'hold';
      rebill.state_changed_at = '2017-11-12T06:03:35.571Z';
      rebill.history = [
        {state: 'hold', entered_at: '2017-11-12T06:03:35.571Z'}
      ];

      return rebillHelper.updateRebillState({rebill: rebill, new_state: 'shipped'})
        .then((rebill) => {
          expect(rebill.previous_state).to.equal('hold');
          expect(rebill.state).to.equal('shipped');
          expect(rebill.history.length).to.equal(2);
          expect(rebill.history[0].state).to.equal('hold');
          expect(rebill.history[0].exited_at).to.equal(rebill.state_changed_at);
          expect(rebill.history[1].state).to.equal('shipped');
          expect(rebill.history[1].entered_at).to.equal(rebill.state_changed_at);
          return expect(rebill.history[1].exited_at).to.equal(undefined);
        })
    });

    it('updates rebill state and history when rebill has history', () => {
      const rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update: ({entity}) => {
          return Promise.resolve(entity);
        },
        get: () => {
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          expect(table).to.equal('rebills');
          expect(object.id_rebill).to.equal(rebill.id);
          expect(object.current_queuename).to.equal('hold');
          expect(object.previous_queuename).to.equal('bill');

          mvu.validateModel(object, global.SixCRM.routes.path('model','aurora/rebills.json'));

          return Promise.resolve();
        }
      });

      const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      const rebillHelper = new RebillHelper();

      rebill.state = 'hold';
      rebill.previous_state = 'bill';
      rebill.state_changed_at = '2017-11-12T06:03:35.571Z';
      rebill.history = [
        {state: 'bill', entered_at: '2017-11-12T06:03:35.571Z'}
      ];

      return rebillHelper.updateRebillState({
        rebill: rebill,
        new_state: 'hold',
        previous_state: 'bill',
        error_message: 'errorMessage'
      })
        .then((rebill) => {
          expect(rebill.previous_state).to.equal('bill');
          expect(rebill.state).to.equal('hold');
          expect(rebill.history.length).to.equal(2);
          expect(rebill.history[0].state).to.equal('bill');
          expect(rebill.history[0].entered_at).to.equal('2017-11-12T06:03:35.571Z');
          expect(rebill.history[0].exited_at).to.equal(rebill.state_changed_at);
          expect(rebill.history[1].state).to.equal('hold');
          expect(rebill.history[1].entered_at).to.equal(rebill.state_changed_at);
          expect(rebill.history[1].exited_at).to.equal(undefined);
          return expect(rebill.history[1].error_message).to.equal('errorMessage');
        })
    });

    it('updates rebill state and history when rebill has more items in history', () => {
      const rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update: ({entity}) => {
          return Promise.resolve(entity);
        },
        get: () => {
          return Promise.resolve(rebill);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'kinesis-firehose-utilities'), {
        putRecord: (table, object) => {
          expect(table).to.equal('rebills');
          expect(object.id_rebill).to.equal(rebill.id);
          expect(object.current_queuename).to.equal('pending');
          expect(object.previous_queuename).to.equal('bill');

          mvu.validateModel(object, global.SixCRM.routes.path('model','aurora/rebills.json'));

          return Promise.resolve();
        }
      });

      const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      const rebillHelper = new RebillHelper();

      rebill.state = 'bill';
      rebill.previous_state = 'hold';
      rebill.state_changed_at = '2017-11-12T07:03:35.571Z';
      rebill.history = [
        {state: 'hold', entered_at: '2017-11-12T06:03:35.571Z', exited_at: '2017-11-12T07:03:35.571Z'},
        {state: 'bill', entered_at: '2017-11-12T07:03:35.571Z'}
      ];

      return rebillHelper.updateRebillState({
        rebill: rebill,
        new_state: 'pending',
        previous_state: 'bill',
        error_message: 'errorMessage'
      })
        .then((rebill) => {
          expect(rebill.previous_state).to.equal('bill');
          expect(rebill.state).to.equal('pending');
          expect(rebill.history.length).to.equal(3);

          expect(rebill.history[0].state).to.equal('hold');
          expect(rebill.history[0].entered_at).to.equal('2017-11-12T06:03:35.571Z');
          expect(rebill.history[0].exited_at).to.equal('2017-11-12T07:03:35.571Z');

          expect(rebill.history[1].state).to.equal('bill');
          expect(rebill.history[1].entered_at).to.equal('2017-11-12T07:03:35.571Z');
          expect(rebill.history[1].exited_at).to.equal(rebill.state_changed_at);

          expect(rebill.history[2].state).to.equal('pending');
          expect(rebill.history[2].entered_at).to.equal(rebill.state_changed_at);
          expect(rebill.history[2].exited_at).to.equal(undefined);
          return expect(rebill.history[2].error_message).to.equal('errorMessage');
        })
    });
  });

  describe('addRebillToQueue', () => {

    it('successfully adds a rebill message to a specified queue', () => {

      let rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage:() => {
          return Promise.resolve(true);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        get: () => {
          return Promise.resolve(rebill);
        }
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      return rebillHelperController.addRebillToQueue({rebill: rebill, queue_name: 'hold'}).then(result => {
        return expect(result).to.equal(true);
      });

    });

  });

  describe('addQueueMessageToQueue', () => {
    it('successfully adds a message to a queue', () => {

      let queue_name = 'hold';
      let queue_message_body_prototype = getValidQueueMessageBodyPrototype();

      mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
        sendMessage:() => {
          return Promise.resolve(true);
        }
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      rebillHelperController.parameters.set('queuename', queue_name);
      rebillHelperController.parameters.set('queuemessagebodyprototype', queue_message_body_prototype);

      return rebillHelperController.addQueueMessageToQueue().then(result => {
        return expect(result).to.equal(true);
      });

    });
  });

  describe('createQueueMessageBodyPrototype', () => {

    it('successfully creates a queue message body prototype from a rebill', () => {

      let rebill = getValidRebill();

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      rebillHelperController.parameters.set('rebill', rebill);

      let result = rebillHelperController.createQueueMessageBodyPrototype();

      expect(result).to.equal(true);
      expect(rebillHelperController.parameters.store['queuemessagebodyprototype']).to.be.defined;

      let parsed_queue_message_body_prototype = JSON.parse(rebillHelperController.parameters.store['queuemessagebodyprototype']);

      expect(parsed_queue_message_body_prototype).to.deep.equal({id: rebill.id});

    });

  });

  describe('getShippingReceipts', () => {

    it('successfully retrieves shipping receipts associated with a rebill', () => {

      let rebill = getValidRebill();
      let transactions = getValidTransactions();
      let shipping_receipts = getValidShippingReceipts();
      let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

      arrayutilities.map(shipping_receipt_ids, (shipping_receipt_id, index) => {
        transactions[0].products[index].shipping_receipt = shipping_receipt_id;
      })

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        listTransactions: () => {
          return Promise.resolve({transactions: transactions});
        },
        get: () => {
          return Promise.resolve(rebill);
        },
        getResult:(result, field) => {
          if(_.isUndefined(field)){
            field = 'rebills';
          }

          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
        getListByAccount: () => {
          return Promise.resolve({shippingreceipts: shipping_receipts});
        },
        getResult:(result, field) => {
          if(_.isUndefined(field)){
            field = 'shippingreceipts';
          }

          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
        }
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      return rebillHelperController.getShippingReceipts({rebill: rebill}).then(result => {
        return expect(result).to.deep.equal(shipping_receipts);
      });

    });

    it('successfully returns a empty array', () => {

      let rebill = getValidRebill();
      let transactions = getValidTransactions();

      //delete transactions[0].products[0].shipping_receipt;
      //delete transactions[1].products[0].shipping_receipt;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        listTransactions: () => {
          return Promise.resolve({transactions: transactions});
        },
        get: () => {
          return Promise.resolve(rebill);
        },
        getResult:(result, field) => {
          if(_.isUndefined(field)){
            field = 'rebills';
          }

          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
        getListByAccount: () => {
          return Promise.resolve(null);
        }
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      return rebillHelperController.getShippingReceipts({rebill: rebill}).then(result => {
        return expect(result).to.deep.equal([]);
      });

    });

  });

  describe('acquireTransactions', () => {

    it('successfully retrieves transactions associated with a rebill', () => {

      let rebill = getValidRebill();
      let transactions = getValidTransactions();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        listTransactions: () => {
          return Promise.resolve({transactions: transactions});
        },
        getResult:(result, field) => {
          if(_.isUndefined(field)){
            field = 'rebills';
          }

          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
        }
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      rebillHelperController.parameters.set('rebill', rebill);

      return rebillHelperController.acquireTransactions().then(result => {
        expect(result).to.equal(true);
        return expect(rebillHelperController.parameters.store['transactions']).to.deep.equal(transactions);
      });

    });

    it('successfully handles the no-transactions case', () => {

      let rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        listTransactions: () => {
          return Promise.resolve({transactions: null});
        },
        getResult:(result, field) => {
          if(_.isUndefined(field)){
            field = 'rebills';
          }

          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
        }
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      rebillHelperController.parameters.set('rebill', rebill);

      return rebillHelperController.acquireTransactions().then(result => {
        expect(result).to.equal(true);
        return expect(rebillHelperController.parameters.store['transactions']).to.not.be.defined;
      });

    });

  });

  describe('getShippingReceiptIDs', () => {

    it('successfully parses shipping receipts ids from a transaction', () => {

      let transactions = getValidTransactions();
      let shipping_receipts = getValidShippingReceipts();
      let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

      arrayutilities.map(shipping_receipts, (shipping_receipt, index) => {
        transactions[0].products[index].shipping_receipt = shipping_receipt.id;
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      rebillHelperController.parameters.set('transactions', transactions);

      let result = rebillHelperController.getShippingReceiptIDs();

      expect(result).to.equal(true);
      expect(rebillHelperController.parameters.store['shippingreceiptids']).to.deep.equal(shipping_receipt_ids);

    });

    it('successfully handles no transactions case', () => {

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      let result = rebillHelperController.getShippingReceiptIDs();

      expect(result).to.equal(true);
      expect(rebillHelperController.parameters.store['shippingreceiptids']).to.not.be.defined;

    });

  });

  describe('acquireShippingReceipts', () => {

    it('successfully acquires shipping receipts given a list of shipping receipt IDs', () => {

      let shipping_receipts = getValidShippingReceipts();
      let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
        getListByAccount: () => {
          return Promise.resolve({shippingreceipts: shipping_receipts});
        },
        getResult:(result, field) => {
          if(_.isUndefined(field)){
            field = 'shippingreceipts';
          }

          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
        }
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      rebillHelperController.parameters.set('shippingreceiptids', shipping_receipt_ids);

      return rebillHelperController.acquireShippingReceipts().then(result => {
        expect(result).to.equal(true);
        return expect(rebillHelperController.parameters.store['shippingreceipts']).to.deep.equal(shipping_receipts);
      });

    });

    it('successfully acquires shipping receipts given a list of shipping receipt IDs', () => {

      let shipping_receipts = getValidShippingReceipts();
      let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
        getListByAccount: () => {
          return Promise.resolve({shippingreceipts: null});
        },
        getResult:(result, field) => {
          if(_.isUndefined(field)){
            field = 'shippingreceipts';
          }

          if(_.has(result, field)){
            return Promise.resolve(result[field]);
          }else{
            return Promise.resolve(null);
          }
        }
      });

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      rebillHelperController.parameters.set('shippingreceiptids', shipping_receipt_ids);

      return rebillHelperController.acquireShippingReceipts().then(result => {
        expect(result).to.equal(true);
        return expect(rebillHelperController.parameters.store['shippingreceipts']).to.not.be.defined;
      });

    });

  });

  describe('getBillableRebills', () => {

    it('successfully retrieves billable rebills', () => {
      const rebill = getValidRebill();

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        getRebillsAfterTimestamp: (stamp) => {
          expect(timestamp.getSecondsDifference(stamp)).to.be.below(5);

          return Promise.resolve([rebill]);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      return rebillHelperController.getBillableRebills().then(result => {
        const rebills = rebillHelperController.parameters.get('billablerebills');

        expect(result).to.equal(true);
        expect(rebills.length).to.equal(1);
        return expect(rebills[0]).to.deep.equal(rebill)
      });

    });

    it('filters out rebills in process', () => {
      const rebill = getValidRebill();

      rebill.processing = true;

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        getRebillsAfterTimestamp: (stamp) => {
          expect(timestamp.getSecondsDifference(stamp)).to.be.below(5);

          return Promise.resolve([rebill]);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('read', 'rebill', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      let rebillHelperController = new RebillHelperController();

      return rebillHelperController.getBillableRebills().then(result => {
        const rebills = rebillHelperController.parameters.get('billablerebills');

        expect(result).to.equal(true);
        return expect(rebills.length).to.equal(0);
      });

    });

  });

});
