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

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
let RebillHelperController = global.SixCRM.routes.include('helpers', 'rebill/Rebill.js');

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
    entity_type: 'rebill'
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
    completed: 'false',
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

function getValidProductSchedule(){

  return getValidProductSchedules()[0];

}

describe('constructor', () => {

  it('successfully calls the constructor', () => {
    let rebillBuilder = new RebillHelperController();

    expect(objectutilities.getClassName(rebillBuilder)).to.equal('RebillHelper');
  });

});

describe('setParameters', () => {

  it('successfully sets required parameters', () => {

    //required
    let session = getValidSession();

    let rebillBuilder = new RebillHelperController();

    return rebillBuilder.setParameters({argumentation: {session: session}, action: 'createRebill'}).then(() => {

      expect(rebillBuilder.parameters.store['session']).to.equal(session);

    });

  });

  it('successfully sets optional parameters', () => {

    //required
    let session = getValidSession();

    let day = 2;

    let product_schedules = [getValidProductSchedule()];

    let rebillBuilder = new RebillHelperController();

    return rebillBuilder.setParameters({argumentation: {session: session, day: day, product_schedules: product_schedules}, action: 'createRebill'}).then(() => {

      expect(rebillBuilder.parameters.store['session']).to.equal(session);
      expect(rebillBuilder.parameters.store['day']).to.equal(day);
      expect(rebillBuilder.parameters.store['productschedules']).to.equal(product_schedules);

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

    mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
      addToSearchIndex: (entity) => {
        return entity;
      }
    });

    PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

    let session = getValidSession();

    let rebillBuilder = new RebillHelperController();

    rebillBuilder.parameters.set('session', session);

    return rebillBuilder.hydrateArguments().then(() => {

      expect(rebillBuilder.parameters.store['productschedules']).to.be.defined;
      expect(rebillBuilder.parameters.store['day']).to.be.defined;

    });

  });

});


describe('validateArguments', () => {

  it('successfully validates a session productschedule pair', () => {

    let session = getValidSession();
    let product_schedules = [getValidProductSchedule()];

    let rebillBuilder = new RebillHelperController();

    rebillBuilder.parameters.set('session', session);
    rebillBuilder.parameters.set('productschedules', product_schedules);

    return rebillBuilder.validateArguments().then(result => {
      expect(result).to.equal(true);
    })

  });

  it('successfully returns an error for a productschedule pair which are not associated', () => {

    let session = getValidSession();

    session.product_schedules = [];

    let product_schedules = [getValidProductSchedule()];

    let rebillBuilder = new RebillHelperController();

    rebillBuilder.parameters.set('session', session);
    rebillBuilder.parameters.set('productschedules', product_schedules);

    try{
      rebillBuilder.validateArguments();
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

      mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
        addToSearchIndex: (entity) => {
          return entity;
        }
      });

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

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'redshift/Activity.js'), {
        createActivity: (actor, action, acted_upon, associated_with) => {
          return true;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('lib', 'indexing-utilities.js'), {
        addToSearchIndex: (entity) => {
          return entity;
        }
      });

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

      let expected_rebill = {
        account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
        amount: product_schedules[0].schedule[0].price,
        bill_at: "2017-04-06T18:40:41.000Z",
        entity_type: "rebill",
        parentsession: session.id,
        product_schedules: [product_schedules[0].id],
        products: [
          {
            product: product_schedules[0].schedule[0].product_id,
            amount: product_schedules[0].schedule[0].price
          }
        ]
      };

      let rebillHelper = new RebillHelperController();

      return rebillHelper.createRebill({session: session, day: day, product_schedules: product_schedules}).then(result => {

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

      return rebillHelper.createRebill({session: session, day: day, product_schedules: product_schedules}).then(result => {

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

      return rebillHelper.createRebill({session: session, day: day, product_schedules: product_schedules}).then(result => {

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

      return rebillHelper.createRebill({session: session, day: day, product_schedules: product_schedules}).then(result => {

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

      return rebillHelper.createRebill({session: session, day: day, product_schedules: product_schedules}).then(result => {

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
