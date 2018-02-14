'use strict'

const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');

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

function getValidRebillPrototype(){

  let rebill = MockEntities.getValidRebill();

  delete rebill.id;
  delete rebill.created_at;
  delete rebill.updated_at;
  delete rebill.account;

  return rebill;

}

function getValidBillDate(){
  return timestamp.getISO8601();
}

function getValidSession(id){

  return MockEntities.getValidSession(id)

}

function getValidProduct(id){
  return MockEntities.getValidProduct(id);
}

function getValidProductSchedule(id){

  return MockEntities.getValidProductSchedule(id);

}

function getValidNormalizedProductSchedule(){
  return MockEntities.getValidProductSchedule();
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

  describe('constructor', () => {

    it('successfully calls the constructor', () => {
      let rebillCreatorHelper = new RebillCreatorHelperController();

      expect(objectutilities.getClassName(rebillCreatorHelper)).to.equal('RebillCreatorHelper');
    });

  });

  describe('setParameters', () => {

    it('successfully sets required parameters', () => {

      //required
      let session = getValidSession();

      let rebillCreatorHelper = new RebillCreatorHelperController();

      return rebillCreatorHelper.setParameters({argumentation: {session: session}, action: 'createRebill'}).then(() => {

        expect(rebillCreatorHelper.parameters.store['session']).to.equal(session);

      });

    });

    it('successfully sets optional parameters', () => {

      //required
      let session = getValidSession();

      let day = 2;

      let product_schedules = getValidProductSchedules();

      let rebillCreatorHelper = new RebillCreatorHelperController();

      return rebillCreatorHelper.setParameters({argumentation: {session: session, day: day, product_schedules: product_schedules}, action: 'createRebill'}).then(() => {

        expect(rebillCreatorHelper.parameters.store['session']).to.equal(session);
        expect(rebillCreatorHelper.parameters.store['day']).to.equal(day);
        expect(rebillCreatorHelper.parameters.store['productschedules']).to.equal(product_schedules);

      });

    });

  });

  describe('hydrateArguments', () => {

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

    it('successfully hydrates the arguments from the session object', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index, callback) => {
          return Promise.resolve({productschedules:[getValidProductSchedule()]});
        },
        saveRecord: (tableName, entity, callback) => {
          return Promise.resolve(entity);
        },
        createINQueryParameters: (field_name, in_array) => {
          arrayutilities.nonEmpty(in_array, true);
          if(!arrayutilities.assureEntries(in_array, 'string')){
            eu.throwError('server', 'All entries in the "in_array" must be of type string.');
          }
          let in_object = {};

          arrayutilities.map(in_array, (value) => {
            var in_key = ":"+randomutilities.createRandomString(10);

            while(_.has(in_object, in_key)){
              in_key = ":"+randomutilities.createRandomString(10);
            }
            in_object[in_key.toString()] = value;
          });
          return {
            filter_expression : field_name+" IN ("+Object.keys(in_object).toString()+ ")",
            expression_attribute_values : in_object
          };
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
        createActivity: (actor, action, acted_upon, associated_with) => {
          return true;
        }
      });

      let mock_preindexing_helper = class {
        constructor(){

        }
        addToSearchIndex(entity){
          return Promise.resolve(true);
        }
        removeFromSearchIndex(entity){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let session = getValidSession();

      let rebillCreatorHelper = new RebillCreatorHelperController();

      rebillCreatorHelper.parameters.set('session', session);

      return rebillCreatorHelper.hydrateArguments().then(() => {

        expect(rebillCreatorHelper.parameters.store['productschedules']).to.be.defined;
        expect(rebillCreatorHelper.parameters.store['day']).to.be.defined;

      });

    });

  });


  describe('validateArguments', () => {

    it('successfully validates a session productschedule pair', () => {

      let session = getValidSession();
      let product_schedules = [getValidProductSchedule()];

      session.product_schedules = arrayutilities.map(product_schedules, product_schedule => product_schedule.id);

      let rebillCreatorHelper = new RebillCreatorHelperController();

      rebillCreatorHelper.parameters.set('session', session);
      rebillCreatorHelper.parameters.set('productschedules', product_schedules);
      rebillCreatorHelper.parameters.set('day', 1);

      return rebillCreatorHelper.validateArguments().then(result => {
        expect(result).to.equal(true);
      })

    });

    it('successfully returns an error for a productschedule pair which are not associated', () => {

      let session = getValidSession();

      session.product_schedules = [];

      let product_schedules = [getValidProductSchedule()];

      let rebillCreatorHelper = new RebillCreatorHelperController();

      rebillCreatorHelper.parameters.set('day', 1);
      rebillCreatorHelper.parameters.set('session', session);
      rebillCreatorHelper.parameters.set('productschedules', product_schedules);

      try{
        rebillCreatorHelper.validateArguments();
      }catch(error){
        expect(error.message).to.have.string('The specified product schedule is not contained in the session object');
      }

    });

  });

  describe('getNextProductScheduleBillDayNumber', () => {

    it('successfully acquires the next product schedule bill day number', () => {

      let product_schedule = getValidProductSchedule();

      product_schedule.schedule = [
        {
          product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
          price:4.99,
          start:0,
          end:14,
          period:14
        },
        {
          product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
          price:34.99,
          start:14,
          end:28,
          period:14
        },
        {
          product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
          price:34.99,
          start:28,
          period:28
        }
      ];

      let test_cases = [
        {
          day:-1,
          expect:0
        },
        {
          day: 0,
          expect:14
        },
        {
          day: 1,
          expect:14
        },
        {
          day: 13,
          expect:14
        },
        {
          day: 14,
          expect:28
        },
        {
          day: 15,
          expect:28
        },
        {
          day: 27,
          expect:28
        },
        {
          day: 28,
          expect:56
        },
        {
          day: 29,
          expect:56
        },
        {
          day: 55,
          expect:56
        },
        {
          day: 56,
          expect:84
        },
        {
          day: 2992,
          expect:2996
        }
      ];

      return Promise.all(arrayutilities.map(test_cases, test_case => {

        let rebillCreatorHelper = new RebillCreatorHelperController();

        rebillCreatorHelper.parameters.set('normalizedproductschedules',[{quantity: 1, product_schedule: product_schedule}]);
        rebillCreatorHelper.parameters.set('day', test_case.day);

        return rebillCreatorHelper.getNextProductScheduleBillDayNumber().then(result => {
          expect(rebillCreatorHelper.parameters.get('nextproductschedulebilldaynumber')).to.equal(test_case.expect);
        });

      }));

    });

    it('successfully acquires the next product schedule bill day number against product schedule with lots of primes', () => {

      let product_schedule = getValidProductSchedules()[1];

      product_schedule.schedule = [
        {
          product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
          price:4.99,
          start:17,
          end:23,
          period:33
        },
        {
          product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
          price:34.99,
          start:51,
          end:750,
          period:13
        },
        {
          product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
          price:34.99,
          start:908,
          period:31
        }
      ];

      let test_cases = [
        {
          day:-1,
          expect:17
        },
        {
          day: 0,
          expect:17
        },
        {
          day: 1,
          expect:17
        },
        {
          day: 16,
          expect:17
        },
        {
          day: 17,
          expect:51
        },
        {
          day: 22,
          expect:51
        },
        {
          day: 23,
          expect:51
        },
        {
          day: 50,
          expect:51
        },
        {
          day: 51,
          expect:64
        },
        {
          day: 63,
          expect:64
        },
        {
          day: 64,
          expect:77
        },
        {
          day: 65,
          expect:77
        },
        {
          day: 908,
          expect:939
        },
        {
          day: 909,
          expect:939
        },
        {
          day: 938,
          expect:939
        },
        {
          day: 939,
          expect:970
        }
      ];

      return Promise.all(arrayutilities.map(test_cases, test_case => {

        let rebillCreatorHelper = new RebillCreatorHelperController();

        rebillCreatorHelper.parameters.set('normalizedproductschedules',[{quantity: 1, product_schedule: product_schedule}]);
        rebillCreatorHelper.parameters.set('day', test_case.day);

        return rebillCreatorHelper.getNextProductScheduleBillDayNumber().then(result => {

          expect(rebillCreatorHelper.parameters.store['nextproductschedulebilldaynumber']).to.equal(test_case.expect);
        });

      }));

    });

  });

  describe('getScheduleElementsOnBillDay', () => {

    it('successfully acquires the schedule elements on a bill day', () => {

      let product_schedule = getValidProductSchedule();

      product_schedule.schedule = [
        {
          product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
          price:4.99,
          start:0,
          end:14,
          period:14
        },
        {
          product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
          price:34.99,
          start:14,
          end:28,
          period:14
        },
        {
          product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
          price:34.99,
          start:28,
          period:28
        }
      ];

      let test_cases = [
        {
          day:0,
          expect:product_schedule.schedule[0]
        },
        {
          day:14,
          expect:product_schedule.schedule[1]
        },
        {
          day:28,
          expect:product_schedule.schedule[2]
        },
        {
          day:56,
          expect:product_schedule.schedule[2]
        },
        {
          day: ((randomutilities.randomInt(200, 455020) * product_schedule.schedule[2].period) + product_schedule.schedule[2].start),
          expect:product_schedule.schedule[2]
        }
      ];

      return Promise.all(arrayutilities.map(test_cases, test_case => {

        let rebillCreatorHelper = new RebillCreatorHelperController();

        rebillCreatorHelper.parameters.set('normalizedproductschedules',[{quantity: 1, product_schedule: product_schedule}]);
        rebillCreatorHelper.parameters.set('nextproductschedulebilldaynumber', test_case.day);

        return rebillCreatorHelper.getScheduleElementsOnBillDay().then((result) => {

          expect(rebillCreatorHelper.parameters.store['scheduleelementsonbillday']).to.deep.equal([{quantity: 1, schedule_element: test_case.expect}]);

        });

      }));

    });

    it('handles a non-bill day', () => {

      let product_schedule = getValidProductSchedule();

      product_schedule.schedule = [
        {
          product:"616cc994-9480-4640-b26c-03810a679fe3",
          price:4.99,
          start:17,
          end:23,
          period:33
        },
        {
          product:"be992cea-e4be-4d3e-9afa-8e020340ed16",
          price:34.99,
          start:51,
          end:750,
          period:13
        },
        {
          product:"be992ceb-e4be-4d3e-9afa-8e020340ed16",
          price:34.99,
          start:908,
          period:31
        }
      ];

      let test_cases = [
        {
          day:16,
          expect:null
        },
        {
          day:-1,
          expect:null
        },
        {
          day:800,
          expect:null
        }
      ];

      return Promise.all(arrayutilities.map(test_cases, test_case => {

        let rebillCreatorHelper = new RebillCreatorHelperController();

        rebillCreatorHelper.parameters.set('productschedules',[product_schedule]);
        rebillCreatorHelper.parameters.set('nextproductschedulebilldaynumber', test_case.day);

        return rebillCreatorHelper.getScheduleElementsOnBillDay().then((result) => {

          let elements = rebillCreatorHelper.parameters.get('scheduleelementsonbillday', null, false);

          expect(elements).to.equal(test_case.expect);

        });

      }));

    });

    it('successfully acquires the schedule elements on a bill day', () => {

      let product_schedule = getValidProductSchedules()[1];

      product_schedule.schedule = [
        {
          product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
          price:4.99,
          start:17,
          end:23,
          period:33
        },
        {
          product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
          price:34.99,
          start:51,
          end:750,
          period:13
        },
        {
          product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
          price:34.99,
          start:908,
          period:31
        }
      ];

      let test_cases = [
        {
          day:17,
          expect:product_schedule.schedule[0]
        },
        {
          day:51,
          expect:product_schedule.schedule[1]
        },
        {
          day:64,
          expect:product_schedule.schedule[1]
        },
        {
          day: ((randomutilities.randomInt(1, (Math.floor(((product_schedule.schedule[1].end - product_schedule.schedule[1].start) / product_schedule.schedule[1].period))) - 1) * product_schedule.schedule[1].period) + product_schedule.schedule[1].start),
          expect:product_schedule.schedule[1]
        },
        {
          day:908,
          expect:product_schedule.schedule[2]
        },
        {
          day: ((randomutilities.randomInt(200, 455020) * product_schedule.schedule[2].period) + product_schedule.schedule[2].start),
          expect:product_schedule.schedule[2]
        }
      ];

      return Promise.all(arrayutilities.map(test_cases, test_case => {

        let rebillCreatorHelper = new RebillCreatorHelperController();

        rebillCreatorHelper.parameters.set('normalizedproductschedules',[{quantity: 1, product_schedule: product_schedule}]);
        rebillCreatorHelper.parameters.set('nextproductschedulebilldaynumber', test_case.day);

        return rebillCreatorHelper.getScheduleElementsOnBillDay().then((result) => {

          expect(rebillCreatorHelper.parameters.store['scheduleelementsonbillday']).to.deep.equal([{quantity: 1, schedule_element: test_case.expect}]);

        });

      }));

    });

  });

  describe('calculateAmount', () => {

    it('successfully calculates the amount from the transaction products', () => {

      let test_cases = [
        {
          transaction_products:[{
            product:getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
            amount: 12.39,
            quantity: 1
          }],
          expect: 12.39
        },
        {
          transaction_products:[{
            product:getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
            amount: 12.39,
            quantity: 1
          },
          {
            product:getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
            amount: 21.67,
            quantity: 1
          }],
          expect: 34.06
        },
        {
          transaction_products:[],
          expect: 0
        },
        {
          transaction_products:[{
            product:getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
            quantity: 1,
            amount: 0.00
          },
          {
            product:getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
            quantity: 1,
            amount: 21.67
          }],
          expect: 21.67
        }
      ];

      return Promise.all(arrayutilities.map(test_cases, test_case => {

        let rebillCreatorHelper = new RebillCreatorHelperController();

        rebillCreatorHelper.parameters.set('transactionproducts', test_case.transaction_products);

        return rebillCreatorHelper.calculateAmount().then(result => {
          expect(result).to.equal(true);
          expect(rebillCreatorHelper.parameters.store['amount']).to.equal(test_case.expect);
        });

      }));

    });

  });

  describe('calculateBillAt', () => {

    it('successfully sets the bill_at property', () => {

      let session = getValidSession();

      session.created_at = '2017-04-06T18:40:41.000Z';

      let test_cases = [
        {
          days: 14,
          expect: '2017-04-20T18:40:41.000Z'
        },
        {
          days: 365,
          expect: '2018-04-06T18:40:41.000Z'
        },
        {
          days: 28,
          expect: '2017-05-04T18:40:41.000Z'
        }
      ];

      return Promise.all(arrayutilities.map(test_cases, test_case => {

        let rebillCreatorHelper = new RebillCreatorHelperController();

        rebillCreatorHelper.parameters.set('session', session);
        rebillCreatorHelper.parameters.set('nextproductschedulebilldaynumber', test_case.days);

        return rebillCreatorHelper.calculateBillAt().then(result => {
          expect(result).to.equal(true);
          expect(rebillCreatorHelper.parameters.get('billdate', null, false)).to.equal(test_case.expect);
        });

      }));

    });

  });

  describe('buildRebillPrototype', () => {

    it('successfully builds a rebill prototype', () => {

      let rebillCreatorHelper = new RebillCreatorHelperController();

      let normalized_product_schedules = [
        {
          product_schedule: getValidProductSchedule(),
          quantity: 1
        },
        {
          product_schedule: getValidProductSchedule(),
          quantity: 1
        }
      ];


      rebillCreatorHelper.parameters.set('transactionproducts', [{
        product: getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
        amount: 12.99,
        quantity: 1
      }]);

      rebillCreatorHelper.parameters.set('billdate', getValidBillDate());
      rebillCreatorHelper.parameters.set('amount', 12.99);
      rebillCreatorHelper.parameters.set('normalizedproductschedules', normalized_product_schedules);
      rebillCreatorHelper.parameters.set('session', getValidSession());
      rebillCreatorHelper.parameters.set('nextproductschedulebilldaynumber',0);

      return rebillCreatorHelper.buildRebillPrototype().then(result => {
        expect(result).to.equal(true);

        let prospective_rebill_prototype = rebillCreatorHelper.parameters.get('rebillprototype');

        expect(prospective_rebill_prototype).to.have.property('products');
        expect(prospective_rebill_prototype).to.have.property('bill_at');
        expect(prospective_rebill_prototype).to.have.property('amount');
        expect(prospective_rebill_prototype).to.have.property('product_schedules');
        expect(prospective_rebill_prototype).to.have.property('parentsession');

      });

    });

  });

  describe('pushRebill', () => {

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

    it('successfully saves a rebill to the database', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index, callback) => {
          return Promise.resolve([]);
        },
        saveRecord: (tableName, entity, callback) => {
          return Promise.resolve(entity);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
        createActivity: (actor, action, acted_upon, associated_with) => {
          return true;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
        constructor(){}
        addToSearchIndex(entity){
          return Promise.resolve(true);
        }
        removeFromSearchIndex(entity){
          return Promise.resolve(true);
        }
      });

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

      let rebillCreatorHelper = new RebillCreatorHelperController();

      rebillCreatorHelper.parameters.set('rebillprototype', getValidRebillPrototype());

      return rebillCreatorHelper.pushRebill().then(result => {
        expect(result).to.equal(true);
        let rebill = rebillCreatorHelper.parameters.get('rebill');

        expect(rebill).to.have.property('id');
        expect(rebill).to.have.property('created_at');
        expect(rebill).to.have.property('updated_at');
        expect(rebill).to.have.property('account');
      })

    });

  });

  describe('returnRebill', () => {
    it('successfully returns a rebill object', () => {
      let rebill = getValidRebill();
      let rebillCreatorHelper = new RebillCreatorHelperController();

      rebillCreatorHelper.parameters.set('rebill', rebill);
      return rebillCreatorHelper.returnRebill().then(result => {
        expect(result).to.deep.equal(rebill);
      });
    });
  });

  describe('acquireRebillProperties', () => {

    it('Successfully acquires rebill properties', () => {

      let rebillCreatorHelper = new RebillCreatorHelperController();

      let session = getValidSession();

      session.created_at = '2017-04-06T18:40:41.405Z';

      let product_schedule = getValidProductSchedule();

      product_schedule.schedule = [
        {
          product: getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
          price:4.99,
          start:0,
          end:14,
          period:14
        },
        {
          product: getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
          price:34.99,
          start:14,
          end:28,
          period:14
        },
        {
          product: getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
          price:34.99,
          start:28,
          period:28
        }
      ];

      let product_schedules = [{quantity: 1, product_schedule: product_schedule}];

      session.product_schedules = arrayutilities.map(product_schedules, product_schedule_group => product_schedule_group.product_schedule.id);

      rebillCreatorHelper.parameters.set('session', session);
      rebillCreatorHelper.parameters.set('day', -1);
      rebillCreatorHelper.parameters.set('normalizedproductschedules', product_schedules);

      let expected_day_number = 0;
      let expected_schedule_elements = [{quantity: 1, schedule_element: product_schedule.schedule[0]}];
      let expected_transaction_products = [{
        product:product_schedule.schedule[0].product,
        amount:product_schedule.schedule[0].price,
        quantity: 1
      }];
      let expected_amount = product_schedule.schedule[0].price;
      let expected_billdate = '2017-04-06T18:40:41.000Z';

      return rebillCreatorHelper.acquireRebillProperties().then(result => {

        expect(result).to.equal(true);

        let day_number = rebillCreatorHelper.parameters.get('nextproductschedulebilldaynumber');
        let schedule_elements = rebillCreatorHelper.parameters.get('scheduleelementsonbillday');
        let transaction_products = rebillCreatorHelper.parameters.get('transactionproducts');
        let amount = rebillCreatorHelper.parameters.get('amount');
        let billdate = rebillCreatorHelper.parameters.get('billdate');

        expect(day_number).to.equal(expected_day_number);
        expect(schedule_elements).to.deep.equal(expected_schedule_elements);
        expect(transaction_products).to.deep.equal(expected_transaction_products);
        expect(amount).to.equal(expected_amount);
        expect(billdate).to.equal(expected_billdate);

      });

    });

  });

  describe('createRebill', () => {

    let product_schedules = [{quantity: 1, product_schedule: getValidProductSchedule()}];

    product_schedules[0].product_schedule.schedule = [
      {
        product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
        price:4.99,
        start:0,
        end:14,
        period:14
      },
      {
        product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
        price:34.99,
        start:14,
        end:28,
        period:14
      },
      {
        product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
        price:34.99,
        start:28,
        period:28
      }
    ];

    let product_schedule_ids = arrayutilities.map(product_schedules, product_schedule_group => product_schedule_group.product_schedule.id);
    let session = getValidSession();

    session.created_at = '2017-04-06T18:40:41.000Z';
    session.product_schedules = product_schedule_ids;

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
        queryRecords: (table, parameters, index, callback) => {
          return Promise.resolve([]);
        },
        saveRecord: (tableName, entity, callback) => {
          return Promise.resolve(entity);
        },
        createINQueryParameters: (field_name, in_array) => {
          arrayutilities.nonEmpty(in_array, true);
          if(!arrayutilities.assureEntries(in_array, 'string')){
            eu.throwError('server', 'All entries in the "in_array" must be of type string.');
          }
          let in_object = {};

          arrayutilities.map(in_array, (value) => {
            var in_key = ":"+randomutilities.createRandomString(10);

            while(_.has(in_object, in_key)){
              in_key = ":"+randomutilities.createRandomString(10);
            }
            in_object[in_key.toString()] = value;
          });
          return {
            filter_expression : field_name+" IN ("+Object.keys(in_object).toString()+ ")",
            expression_attribute_values : in_object
          };
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), {
        listProductSchedules:(session) => {
          return Promise.resolve({productschedules:product_schedules});
        },
        getResult: (object, field) => {
          return product_schedules;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ProductSchedule.js'), {
        listProductSchedulesByList:({product_schedules}) => {
          return Promise.resolve({productschedules:product_schedules});
        },
        getResult: (object, field) => {
          return product_schedules;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
        createActivity: (actor, action, acted_upon, associated_with) => {
          return true;
        }
      });

      let mock_preindexing_helper = class {
        constructor(){

        }
        addToSearchIndex(entity){
          return Promise.resolve(true);
        }
        removeFromSearchIndex(entity){
          return Promise.resolve(true);
        }
      }

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

      PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

    });

    afterEach(() => {
      //Technical Debt:  This is causing issues when there is no network...
      mockery.resetCache();
      mockery.deregisterAll();
    });

    it('successfully creates a rebill for 0th day', () => {

      let day = -1;

      let expected_rebill = {
        account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
        amount: product_schedules[0].product_schedule.schedule[0].price,
        bill_at: "2017-04-06T18:40:41.000Z",
        entity_type: "rebill",
        parentsession: session.id,
        processing: true,
        product_schedules: product_schedule_ids,
        products: [
          {
            product: product_schedules[0].product_schedule.schedule[0].product,
            amount: product_schedules[0].product_schedule.schedule[0].price,
            quantity: 1
          }
        ]
      };

      let rebillCreatorHelper = new RebillCreatorHelperController();

      session.product_schedules = [];
      rebillCreatorHelper.parameters.set('session', session);

      return rebillCreatorHelper.createRebill({session: session, day: day}).then(result => {

        let created_at = result.created_at;
        let updated_at = result.updated_at;
        let id = result.id;

        delete result.created_at;
        delete result.updated_at;
        delete result.id;

        expect(result).to.deep.equal(expected_rebill);

      });
    });

    it('successfully creates a rebill for 14th day', () => {

      let day = 0;

      let expected_rebill = {
        account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
        amount: product_schedules[0].product_schedule.schedule[1].price,
        bill_at: "2017-04-20T18:40:41.000Z",
        entity_type: "rebill",
        parentsession: session.id,
        product_schedules: [product_schedules[0].product_schedule.id],
        products: [
          {
            product: product_schedules[0].product_schedule.schedule[1].product,
            amount: product_schedules[0].product_schedule.schedule[1].price,
            quantity: 1
          }
        ]
      };

      let rebillCreatorHelper = new RebillCreatorHelperController();

      session.watermark = {product_schedules: product_schedules};

      return rebillCreatorHelper.createRebill({session: session, day: day}).then(result => {

        let created_at = result.created_at;
        let updated_at = result.updated_at;
        let id = result.id;

        delete result.created_at;
        delete result.updated_at;
        delete result.id;

        expect(result).to.deep.equal(expected_rebill);

      });
    });

    it('successfully creates a rebill for 28th day', () => {

      let day = 14;

      let expected_rebill = {
        account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
        amount: product_schedules[0].product_schedule.schedule[2].price,
        bill_at: "2017-05-04T18:40:41.000Z",
        entity_type: "rebill",
        parentsession: session.id,
        product_schedules: [product_schedules[0].product_schedule.id],
        products: [
          {
            product: product_schedules[0].product_schedule.schedule[2].product,
            amount: product_schedules[0].product_schedule.schedule[2].price,
            quantity: 1
          }
        ]
      };

      let rebillCreatorHelper = new RebillCreatorHelperController();

      return rebillCreatorHelper.createRebill({session: session, day: day}).then(result => {

        let created_at = result.created_at;
        let updated_at = result.updated_at;
        let id = result.id;

        delete result.created_at;
        delete result.updated_at;
        delete result.id;

        expect(result).to.deep.equal(expected_rebill);

      });
    });

    it('successfully creates a rebill for 56th day', () => {

      let day = 28;

      let expected_rebill = {
        account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
        amount: product_schedules[0].product_schedule.schedule[2].price,
        bill_at: "2017-06-01T18:40:41.000Z",
        entity_type: "rebill",
        parentsession: session.id,
        product_schedules: [product_schedules[0].product_schedule.id],
        products: [
          {
            product: product_schedules[0].product_schedule.schedule[2].product,
            amount: product_schedules[0].product_schedule.schedule[2].price,
            quantity: 1
          }
        ]
      };

      let rebillCreatorHelper = new RebillCreatorHelperController();

      return rebillCreatorHelper.createRebill({session: session, day: day}).then(result => {

        let created_at = result.created_at;
        let updated_at = result.updated_at;
        let id = result.id;

        delete result.created_at;
        delete result.updated_at;
        delete result.id;

        expect(result).to.deep.equal(expected_rebill);

      });
    });

    it('successfully creates a rebill for 56th day from a non-bill date', () => {

      let day = 29;

      let expected_rebill = {
        account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
        amount: product_schedules[0].product_schedule.schedule[2].price,
        bill_at: "2017-06-01T18:40:41.000Z",
        entity_type: "rebill",
        parentsession: session.id,
        product_schedules: [product_schedules[0].product_schedule.id],
        products: [
          {
            product: product_schedules[0].product_schedule.schedule[2].product,
            amount: product_schedules[0].product_schedule.schedule[2].price,
            quantity: 1
          }
        ]
      };

      let rebillCreatorHelper = new RebillCreatorHelperController();

      return rebillCreatorHelper.createRebill({session: session, day: day}).then(result => {

        let created_at = result.created_at;
        let updated_at = result.updated_at;
        let id = result.id;

        delete result.created_at;
        delete result.updated_at;
        delete result.id;

        expect(result).to.deep.equal(expected_rebill);

      });

    });

  });

});
