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
let RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');

function getValidTransactions(){

  return [getValidTransaction(), getValidTransaction()];

}

function getValidTransaction(){

  return {
    id: uuidV4(),
    amount: 14.99,
    alias:"T"+randomutilities.createRandomString(9),
    account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
    rebill: uuidV4(),
    processor_response: "{\"message\":\"Success\",\"result\":{\"response\":\"1\",\"responsetext\":\"SUCCESS\",\"authcode\":\"123456\",\"transactionid\":\"3448894419\",\"avsresponse\":\"N\",\"cvvresponse\":\"\",\"orderid\":\"\",\"type\":\"sale\",\"response_code\":\"100\"}}",
    merchant_provider: uuidV4(),
    products:[{
      product:uuidV4(),
      amount:14.99,
      shipping_receipt: uuidV4()
    }],
    type:"sale",
    result:"success",
    created_at:timestamp.getISO8601(),
    updated_at:timestamp.getISO8601()
  };

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

function getValidRebill(){

  return {
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

}

function getValidRebillPrototype(){

  return {
    parentsession: uuidV4(),
    bill_at: "2017-04-06T18:40:41.405Z",
    amount: 12.22,
    product_schedules:[uuidV4(), uuidV4(), uuidV4()],
    products: [{
      product:uuidV4(),
      amount: 3.22
    },{
      product:uuidV4(),
      amount: 9.00
    }]
  }

}

function getValidBillDate(){
  return '2017-08-06T18:41:12.521Z';
}

function getValidSession(){

  return {
    completed: false,
    subaffiliate_5: '45f025bb-a9dc-45c7-86d8-d4b7a4443426',
    created_at: '2017-04-06T18:40:41.405Z',
    subaffiliate_2: '22524f47-9db7-42f9-9540-d34a8909b072',
    subaffiliate_1: '6b6331f6-7f84-437a-9ac6-093ba301e455',
    subaffiliate_4: 'd515c0df-f9e4-4a87-8fe8-c53dcace0995',
    subaffiliate_3: 'fd2548db-66a8-481e-aacc-b2b76a88fea7',
    product_schedules: [ '12529a17-ac32-4e46-b05b-83862843055d' ],
    updated_at: '2017-04-06T18:41:12.521Z',
    affiliate: '332611c7-8940-42b5-b097-c49a765e055a',
    account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
    customer: '24f7c851-29d4-4af9-87c5-0298fa74c689',
    campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
    id: '1fc8a2ef-0db7-4c12-8ee9-fcb7bc6b075d',
    cid: 'fb10d33f-da7d-4765-9b2b-4e5e42287726'
  };

}

function getValidProductSchedules(){

  return [
    {
      id:"12529a17-ac32-4e46-b05b-83862843055d",
      name:"Product Schedule 1",
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      loadbalancer:"927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3",
      schedule:[
        {
          product_id:"616cc994-9480-4640-b26c-03810a679fe3",
          price:4.99,
          start:0,
          end:14,
          period:14
        },
        {
          product_id:"be992cea-e4be-4d3e-9afa-8e020340ed16",
          price:34.99,
          start:14,
          end:28,
          period:14
        },
        {
          product_id:"be992ceb-e4be-4d3e-9afa-8e020340ed16",
          price:34.99,
          start:28,
          period:28
        }
      ],
      created_at:"2017-04-06T18:40:41.405Z",
      updated_at:"2017-04-06T18:41:12.521Z"
    },
    {
      id:"12529a17-ac32-4e46-b05b-83862843055d",
      name:"Product Schedule 1",
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      loadbalancer:"927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3",
      schedule:[
        {
          product_id:"616cc994-9480-4640-b26c-03810a679fe3",
          price:4.99,
          start:17,
          end:23,
          period:33
        },
        {
          product_id:"be992cea-e4be-4d3e-9afa-8e020340ed16",
          price:34.99,
          start:51,
          end:750,
          period:13
        },
        {
          product_id:"be992ceb-e4be-4d3e-9afa-8e020340ed16",
          price:34.99,
          start:908,
          period:31
        }
      ],
      created_at:"2017-04-06T18:40:41.405Z",
      updated_at:"2017-04-06T18:41:12.521Z"
    }
  ]
}

function getValidProductScheduleIDs(){

  return arrayutilities.map(getValidProductSchedules(), product_schedule => {
    return product_schedule.id;
  });

}

function getValidProductSchedule(){

  return getValidProductSchedules()[0];

}
describe('/helpers/entities/Rebill.js', () => {

  describe('constructor', () => {

    it('successfully calls the constructor', () => {
      let rebillHelper = new RebillHelperController();

      expect(objectutilities.getClassName(rebillHelper)).to.equal('RebillHelper');
    });

  });

  describe('setParameters', () => {

    it('successfully sets required parameters', () => {

      //required
      let session = getValidSession();

      let rebillHelper = new RebillHelperController();

      return rebillHelper.setParameters({argumentation: {session: session}, action: 'createRebill'}).then(() => {

        expect(rebillHelper.parameters.store['session']).to.equal(session);

      });

    });

    it('successfully sets optional parameters', () => {

      //required
      let session = getValidSession();

      let day = 2;

      let product_schedules = getValidProductScheduleIDs();

      let rebillHelper = new RebillHelperController();

      return rebillHelper.setParameters({argumentation: {session: session, day: day, product_schedules: product_schedules}, action: 'createRebill'}).then(() => {

        expect(rebillHelper.parameters.store['session']).to.equal(session);
        expect(rebillHelper.parameters.store['day']).to.equal(day);
        expect(rebillHelper.parameters.store['productscheduleids']).to.equal(product_schedules);

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

      let rebillHelper = new RebillHelperController();

      rebillHelper.parameters.set('session', session);

      return rebillHelper.hydrateArguments().then(() => {

        expect(rebillHelper.parameters.store['productschedules']).to.be.defined;
        expect(rebillHelper.parameters.store['day']).to.be.defined;

      });

    });

  });


  describe('validateArguments', () => {

    it('successfully validates a session productschedule pair', () => {

      let session = getValidSession();
      let product_schedules = [getValidProductSchedule()];

      let rebillHelper = new RebillHelperController();

      rebillHelper.parameters.set('session', session);
      rebillHelper.parameters.set('productschedules', product_schedules);
      rebillHelper.parameters.set('day', 1);

      return rebillHelper.validateArguments().then(result => {
        expect(result).to.equal(true);
      })

    });

    it('successfully returns an error for a productschedule pair which are not associated', () => {

      let session = getValidSession();

      session.product_schedules = [];

      let product_schedules = [getValidProductSchedule()];

      let rebillHelper = new RebillHelperController();

      rebillHelper.parameters.set('day', 1);
      rebillHelper.parameters.set('session', session);
      rebillHelper.parameters.set('productschedules', product_schedules);

      try{
        rebillHelper.validateArguments();
      }catch(error){
        expect(error.message).to.have.string('The specified product schedule is not contained in the session object');
      }

    });

  });

  describe('getNextProductScheduleBillDayNumber', () => {

    it('successfully acquires the next product schedule bill day number', () => {

      let product_schedule = getValidProductSchedule();

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

        let rebillHelper = new RebillHelperController();

        rebillHelper.parameters.set('productschedules',[product_schedule]);
        rebillHelper.parameters.set('day', test_case.day);

        return rebillHelper.getNextProductScheduleBillDayNumber().then(result => {
          expect(rebillHelper.parameters.get('nextproductschedulebilldaynumber')).to.equal(test_case.expect);
        });

      }));

    });

    it('successfully acquires the next product schedule bill day number against product schedule with lots of primes', () => {

      let product_schedule = getValidProductSchedules()[1];

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

        let rebillHelper = new RebillHelperController();

        rebillHelper.parameters.set('productschedules',[product_schedule]);
        rebillHelper.parameters.set('day', test_case.day);

        return rebillHelper.getNextProductScheduleBillDayNumber().then(result => {

          expect(rebillHelper.parameters.store['nextproductschedulebilldaynumber']).to.equal(test_case.expect);
        });

      }));

    });

  });

  describe('getScheduleElementsOnBillDay', () => {

    it('successfully acquires the schedule elements on a bill day', () => {

      let product_schedule = getValidProductSchedule();

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

        let rebillHelper = new RebillHelperController();

        rebillHelper.parameters.set('productschedules',[product_schedule]);
        rebillHelper.parameters.set('nextproductschedulebilldaynumber', test_case.day);

        return rebillHelper.getScheduleElementsOnBillDay().then((result) => {

          expect(rebillHelper.parameters.store['scheduleelementsonbillday']).to.deep.equal([test_case.expect]);

        });

      }));

    });

    it('handles a non-bill day', () => {

      let product_schedule = getValidProductSchedules()[1];

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

        let rebillHelper = new RebillHelperController();

        rebillHelper.parameters.set('productschedules',[product_schedule]);
        rebillHelper.parameters.set('nextproductschedulebilldaynumber', test_case.day);

        return rebillHelper.getScheduleElementsOnBillDay().then((result) => {

          let elements = rebillHelper.parameters.get('scheduleelementsonbillday', null, false);

          expect(elements).to.equal(test_case.expect);

        });

      }));

    });

    it('successfully acquires the schedule elements on a bill day', () => {

      let product_schedule = getValidProductSchedules()[1];

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

        let rebillHelper = new RebillHelperController();

        rebillHelper.parameters.set('productschedules',[product_schedule]);
        rebillHelper.parameters.set('nextproductschedulebilldaynumber', test_case.day);

        return rebillHelper.getScheduleElementsOnBillDay().then((result) => {

          expect(rebillHelper.parameters.store['scheduleelementsonbillday']).to.deep.equal([test_case.expect]);

        });

      }));

    });

    describe('getScheduleElementsProducts', () => {

      it('successfully returns schedule element products', () => {

        let product_schedule = getValidProductSchedule();

        let rebillHelper = new RebillHelperController();

        rebillHelper.parameters.set('scheduleelementsonbillday', [product_schedule.schedule[1]]);

        return rebillHelper.getScheduleElementsProducts().then(result => {

          expect(result).to.equal(true);
          expect(rebillHelper.parameters.store['transactionproducts']).to.deep.equal([
            {
              product: product_schedule.schedule[1].product_id,
              amount: product_schedule.schedule[1].price}
          ]);

        });

      });

    });

    describe('calculateAmount', () => {

      it('successfully calculates the amount from the transaction products', () => {

        let test_cases = [
          {
            transaction_products:[{
              product:'45f025bb-a9dc-45c7-86d8-d4b7a4443426',
              amount: 12.39
            }],
            expect: 12.39
          },
          {
            transaction_products:[{
              product:'45f025bb-a9dc-45c7-86d8-d4b7a4443426',
              amount: 12.39
            },
            {
              product:'45f025bb-a9dc-45c7-86d8-d4b7a4443426',
              amount: 21.67
            }],
            expect: 34.06
          },
          {
            transaction_products:[],
            expect: 0
          },
          {
            transaction_products:[{
              product:'45f025bb-a9dc-45c7-86d8-d4b7a4443426',
              amount: 0.00
            },
            {
              product:'45f025bb-a9dc-45c7-86d8-d4b7a4443426',
              amount: 21.67
            }],
            expect: 21.67
          }
        ];

        return Promise.all(arrayutilities.map(test_cases, test_case => {

          let rebillHelper = new RebillHelperController();

          rebillHelper.parameters.set('transactionproducts', test_case.transaction_products);

          return rebillHelper.calculateAmount().then(result => {
            expect(result).to.equal(true);
            expect(rebillHelper.parameters.store['amount']).to.equal(test_case.expect);
          });

        }));

      });

    });

    describe('calculateBillAt', () => {

      it('successfully sets the bill_at property', () => {

        let session = getValidSession();
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

          let rebillHelper = new RebillHelperController();

          rebillHelper.parameters.set('session', session);
          rebillHelper.parameters.set('nextproductschedulebilldaynumber', test_case.days);

          return rebillHelper.calculateBillAt().then(result => {
            expect(result).to.equal(true);
            expect(rebillHelper.parameters.get('billdate', null, false)).to.equal(test_case.expect);
          });

        }));

      });

    });

    describe('buildRebillPrototype', () => {

      it('successfully builds a rebill prototype', () => {

        let rebillHelper = new RebillHelperController();

        rebillHelper.parameters.set('transactionproducts', [{
          product: '45f025bb-a9dc-45c7-86d8-d4b7a4443426',
          amount: 12.99
        }]),
        rebillHelper.parameters.set('billdate', getValidBillDate()),
        rebillHelper.parameters.set('amount', 12.99),
        rebillHelper.parameters.set('productschedules', getValidProductSchedules())
        rebillHelper.parameters.set('session', getValidSession())

        rebillHelper.buildRebillPrototype().then(result => {
          expect(result).to.equal(true);
          let prospective_rebill_prototype = rebillHelper.parameters.get('rebillprototype');

          expect(prospective_rebill_prototype).to.have.property('products');
          expect(prospective_rebill_prototype).to.have.property('bill_at');
          expect(prospective_rebill_prototype).to.have.property('amount');
          expect(prospective_rebill_prototype).to.have.property('product_schedules');
          expect(prospective_rebill_prototype).to.have.property('parentsession');
        })
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

        let rebillHelper = new RebillHelperController();

        rebillHelper.parameters.set('rebillprototype', getValidRebillPrototype());

        return rebillHelper.pushRebill().then(result => {
          expect(result).to.equal(true);
          let rebill = rebillHelper.parameters.get('rebill');

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
        let rebillHelper = new RebillHelperController();

        rebillHelper.parameters.set('rebill', rebill);
        return rebillHelper.returnRebill().then(result => {
          expect(result).to.deep.equal(rebill);
        });
      });
    });

    describe('acquireRebillProperties', () => {

      it('Successfully acquires rebill properties', () => {

        let rebillHelper = new RebillHelperController();

        let session = getValidSession();

        rebillHelper.parameters.set('session', session);
        rebillHelper.parameters.set('day', -1);
        rebillHelper.parameters.set('productschedules', [getValidProductSchedule()]);

        let expected_day_number = 0;
        let expected_schedule_elements = [getValidProductSchedule().schedule[0]];
        let expected_transaction_products = [{
          product:getValidProductSchedule().schedule[0].product_id,
          amount:getValidProductSchedule().schedule[0].price
        }];
        let expected_amount = getValidProductSchedule().schedule[0].price;
        let expected_billdate = '2017-04-06T18:40:41.000Z';

        return rebillHelper.acquireRebillProperties().then(result => {

          expect(result).to.equal(true);

          let day_number = rebillHelper.parameters.get('nextproductschedulebilldaynumber');
          let schedule_elements = rebillHelper.parameters.get('scheduleelementsonbillday');
          let transaction_products = rebillHelper.parameters.get('transactionproducts');
          let amount = rebillHelper.parameters.get('amount');
          let billdate = rebillHelper.parameters.get('billdate');

          expect(day_number).to.equal(expected_day_number);
          expect(schedule_elements).to.deep.equal(expected_schedule_elements);
          expect(transaction_products).to.deep.equal(expected_transaction_products);
          expect(amount).to.equal(expected_amount);
          expect(billdate).to.equal(expected_billdate);

        });

      });

    });

    describe('createRebill', () => {

      before(() => {
          mockery.enable({
              useCleanCache: true,
              warnOnReplace: false,
              warnOnUnregistered: false
          });
      });

      beforeEach(() => {

        let product_schedules = [getValidProductSchedule()];

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

        let session = getValidSession();
        let day = -1;
        let product_schedules = [getValidProductSchedule()];
        let product_schedule_ids = [product_schedules[0].id];

        let expected_rebill = {
          account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
          amount: product_schedules[0].schedule[0].price,
          bill_at: "2017-04-06T18:40:41.000Z",
          entity_type: "rebill",
          parentsession: session.id,
          product_schedules: product_schedule_ids,
          products: [
            {
              product: product_schedules[0].schedule[0].product_id,
              amount: product_schedules[0].schedule[0].price
            }
          ]
        };

        let rebillHelper = new RebillHelperController();

        return rebillHelper.createRebill({session: session, day: day, product_schedules: product_schedule_ids}).then(result => {

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

        let session = getValidSession();
        let day = 0;
        let product_schedules = [getValidProductSchedule()];

        let expected_rebill = {
          account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
          amount: product_schedules[0].schedule[1].price,
          bill_at: "2017-04-20T18:40:41.000Z",
          entity_type: "rebill",
          parentsession: session.id,
          product_schedules: [product_schedules[0].id],
          products: [
            {
              product: product_schedules[0].schedule[1].product_id,
              amount: product_schedules[0].schedule[1].price
            }
          ]
        };

        let rebillHelper = new RebillHelperController();

        return rebillHelper.createRebill({session: session, day: day, product_schedules: [product_schedules[0].id]}).then(result => {

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

        let session = getValidSession();
        let day = 14;
        let product_schedules = [getValidProductSchedule()];

        let expected_rebill = {
          account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
          amount: product_schedules[0].schedule[2].price,
          bill_at: "2017-05-04T18:40:41.000Z",
          entity_type: "rebill",
          parentsession: session.id,
          product_schedules: [product_schedules[0].id],
          products: [
            {
              product: product_schedules[0].schedule[2].product_id,
              amount: product_schedules[0].schedule[2].price
            }
          ]
        };

        let rebillHelper = new RebillHelperController();

        return rebillHelper.createRebill({session: session, day: day, product_schedules: [product_schedules[0].id]}).then(result => {

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

        let session = getValidSession();
        let day = 28;
        let product_schedules = [getValidProductSchedule()];

        let expected_rebill = {
          account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
          amount: product_schedules[0].schedule[2].price,
          bill_at: "2017-06-01T18:40:41.000Z",
          entity_type: "rebill",
          parentsession: session.id,
          product_schedules: [product_schedules[0].id],
          products: [
            {
              product: product_schedules[0].schedule[2].product_id,
              amount: product_schedules[0].schedule[2].price
            }
          ]
        };

        let rebillHelper = new RebillHelperController();

        return rebillHelper.createRebill({session: session, day: day, product_schedules: [product_schedules[0].id]}).then(result => {

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

        let session = getValidSession();
        let day = 29;
        let product_schedules = [getValidProductSchedule()];

        let expected_rebill = {
          account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
          amount: product_schedules[0].schedule[2].price,
          bill_at: "2017-06-01T18:40:41.000Z",
          entity_type: "rebill",
          parentsession: session.id,
          product_schedules: [product_schedules[0].id],
          products: [
            {
              product: product_schedules[0].schedule[2].product_id,
              amount: product_schedules[0].schedule[2].price
            }
          ]
        };

        let rebillHelper = new RebillHelperController();

        return rebillHelper.createRebill({session: session, day: day, product_schedules: [product_schedules[0].id]}).then(result => {

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
        update: ({entity}) => {
          expect.fail();
        }
      });

      const rebillHelper = new RebillHelperController();
      const rebill = {id: 'SOME_REBILL_ID', some_other_field: 'SOME_OTHER_FIELD'};

      return rebillHelper.updateRebillState({rebill: rebill, previous_state: 'bill'})
        .catch((error) => expect(error.message).to.have.string('[500] Missing source object field: "new_state".'))
    });

    it('throws an error when updating with previous state and no history', () => {
      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update: ({entity}) => {
          return Promise.resolve(entity);
        },
        get: ({id}) => {
          return Promise.resolve(rebill);
        }
      });

      const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      const rebillHelper = new RebillHelper();
      const rebill = getValidRebill();

      return rebillHelper.updateRebillState({rebill: rebill, new_state: 'hold', previous_state: 'bill'})
        .catch((error) => expect(error.message).to.have.string('[500] Rebill does not have a history of being in previous state: bill'))
    });

    it('throws an error when updating with previous state and no matching history', () => {
      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update: ({entity}) => {
          return Promise.resolve(entity);
        },
        get: ({id}) => {
          return Promise.resolve(rebill);
        }
      });

      const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      const rebillHelper = new RebillHelper();
      const rebill = getValidRebill();

      rebill.state = 'hold';
      rebill.previous_state = 'bill';
      rebill.state_changed_at = '2017-11-12T07:03:35.571Z';
      rebill.history =  [
        {state: 'bill', entered_at: '2017-11-12T06:03:35.571Z', exited_at: '2017-11-12T07:03:35.571Z'},
        {state: 'hold', entered_at: '2017-11-12T07:03:35.571Z'}
      ];

      return rebillHelper.updateRebillState({rebill: rebill, new_state: 'hold', previous_state: 'bill'})
      .catch((error) => expect(error.message).to.have.string('[500] Rebill does not have a history of being in previous state: bill'))
    });


    it('updates rebill state and history when rebill has history', () => {
      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update: ({entity}) => {
          return Promise.resolve(entity);
        },
        get: ({id}) => {
          return Promise.resolve(rebill);
        }
      });

      const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      const rebillHelper = new RebillHelper();
      const rebill = getValidRebill();

      rebill.state = 'hold';
      rebill.previous_state = 'bill';
      rebill.state_changed_at = '2017-11-12T06:03:35.571Z';
      rebill.history =  [
        {state: 'bill', entered_at: '2017-11-12T06:03:35.571Z'}
      ];

      return rebillHelper.updateRebillState({rebill: rebill, new_state: 'hold', previous_state: 'bill', error_message: 'errorMessage'})
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
          expect(rebill.history[1].error_message).to.equal('errorMessage');
        })
    });

    it('updates rebill state and history when rebill has more items in history', () => {
      mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
        update: ({entity}) => {
          return Promise.resolve(entity);
        },
        get: ({id}) => {
          return Promise.resolve(rebill);
        }
      });

      const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
      const rebillHelper = new RebillHelper();
      const rebill = getValidRebill();

      rebill.state = 'search_indexing';
      rebill.previous_state = 'hold';
      rebill.state_changed_at = '2017-11-12T07:03:35.571Z';
      rebill.history =  [
        {state: 'hold', entered_at: '2017-11-12T06:03:35.571Z', exited_at: '2017-11-12T07:03:35.571Z'},
        {state: 'search_indexing', entered_at: '2017-11-12T07:03:35.571Z'}
      ];

      return rebillHelper.updateRebillState({rebill: rebill, new_state: 'pending', previous_state: 'search_indexing', error_message: 'errorMessage'})
        .then((rebill) => {
          expect(rebill.previous_state).to.equal('search_indexing');
          expect(rebill.state).to.equal('pending');
          expect(rebill.history.length).to.equal(3);

          expect(rebill.history[0].state).to.equal('hold');
          expect(rebill.history[0].entered_at).to.equal('2017-11-12T06:03:35.571Z');
          expect(rebill.history[0].exited_at).to.equal('2017-11-12T07:03:35.571Z');

          expect(rebill.history[1].state).to.equal('search_indexing');
          expect(rebill.history[1].entered_at).to.equal('2017-11-12T07:03:35.571Z');
          expect(rebill.history[1].exited_at).to.equal(rebill.state_changed_at);

          expect(rebill.history[2].state).to.equal('pending');
          expect(rebill.history[2].entered_at).to.equal(rebill.state_changed_at);
          expect(rebill.history[2].exited_at).to.equal(undefined);
          expect(rebill.history[2].error_message).to.equal('errorMessage');
        })
    });

    describe('addRebillToQueue', () => {

      it('successfully adds a rebill message to a specified queue', () => {

        let rebill = getValidRebill();

        mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
          sendMessage:({message_body, queue_name}) => {
            return Promise.resolve(true);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
          get: ({id}) => {
            return Promise.resolve(rebill);
          }
        });

        const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
        let rebillHelperController = new RebillHelperController();

        return rebillHelperController.addRebillToQueue({rebill: rebill, queue_name: 'hold'}).then(result => {
          expect(result).to.equal(true);
        });

      });

    });

    describe('addQueueMessageToQueue', () => {
      it('successfully adds a message to a queue', () => {

        let queue_name = 'hold';
        let queue_message_body_prototype = getValidQueueMessageBodyPrototype();

        mockery.registerMock(global.SixCRM.routes.path('lib', 'sqs-utilities.js'), {
          sendMessage:({message_body, queue_name}) => {
            return Promise.resolve(true);
          }
        });

        const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
        let rebillHelperController = new RebillHelperController();

        rebillHelperController.parameters.set('queuename', queue_name);
        rebillHelperController.parameters.set('queuemessagebodyprototype', queue_message_body_prototype);

        return rebillHelperController.addQueueMessageToQueue().then(result => {
          expect(result).to.equal(true);
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
        let shipping_receipt_ids = [transactions[0].products[0].shipping_receipt, transactions[1].products[0].shipping_receipt];
        let shipping_receipts = getValidShippingReceipts();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
          listTransactions: (rebill) => {
            return Promise.resolve({transactions: transactions});
          },
          get: ({id}) => {
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
          getListByAccount: ({ids}) => {
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
          expect(result).to.deep.equal(shipping_receipts);
        });

      });

      it('successfully returns a empty array', () => {

        let rebill = getValidRebill();
        let transactions = getValidTransactions();

        delete transactions[0].products[0].shipping_receipt;
        delete transactions[1].products[0].shipping_receipt;

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
          listTransactions: (rebill) => {
            return Promise.resolve({transactions: transactions});
          },
          get: ({id}) => {
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
          getListByAccount: ({ids}) => {
            return Promise.resolve(null);
          }
        });

        const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
        let rebillHelperController = new RebillHelperController();

        return rebillHelperController.getShippingReceipts({rebill: rebill}).then(result => {
          expect(result).to.deep.equal([]);
        });

      });

    });

    describe('acquireTransactions', () => {

      it('successfully retrieves transactions associated with a rebill', () => {

        let rebill = getValidRebill();
        let transactions = getValidTransactions();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
          listTransactions: (rebill) => {
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
          expect(rebillHelperController.parameters.store['transactions']).to.deep.equal(transactions);
        });

      });

      it('successfully handles the no-transactions case', () => {

        let rebill = getValidRebill();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), {
          listTransactions: (rebill) => {
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
          expect(rebillHelperController.parameters.store['transactions']).to.not.be.defined;
        });

      });

    });

    describe('getShippingReceiptIDs', () => {

      it('successfully parses shipping receipts ids from a transaction', () => {

        let transactions = getValidTransactions();
        let shipping_receipt_ids = [transactions[0].products[0].shipping_receipt, transactions[1].products[0].shipping_receipt];

        const RebillHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
        let rebillHelperController = new RebillHelperController();

        rebillHelperController.parameters.set('transactions', transactions);

        let result = rebillHelperController.getShippingReceiptIDs();

        expect(result).to.equal(true);
        expect(rebillHelperController.parameters.store['shippingreceiptids']).to.deep.equal(shipping_receipt_ids);

      });

      it('successfully handles no transactions case', () => {

        let transactions = getValidTransactions();
        let shipping_receipt_ids = [transactions[0].products[0].shipping_receipt, transactions[1].products[0].shipping_receipt];

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

        mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
          getListByAccount: ({ids}) => {
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
          expect(rebillHelperController.parameters.store['shippingreceipts']).to.deep.equal(shipping_receipts);
        });

      });

      it('successfully acquires shipping receipts given a list of shipping receipt IDs', () => {

        let shipping_receipts = getValidShippingReceipts();
        let shipping_receipt_ids = arrayutilities.map(shipping_receipts, shipping_receipt => shipping_receipt.id);

        mockery.registerMock(global.SixCRM.routes.path('entities', 'ShippingReceipt.js'), {
          getListByAccount: ({ids}) => {
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
          expect(rebillHelperController.parameters.store['shippingreceipts']).to.not.be.defined;
        });

      });

    });

  });

});
