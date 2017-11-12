'use strict'

const _ = require('underscore');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
let RebillHelperController = global.SixCRM.routes.include('helpers', 'rebill/Rebill.js');


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
      expect(rebillBuilder.parameters.store['product_schedules']).to.equal(product_schedules);

    });

  });

});

describe('hydrateArguments', () => {

  it('successfully hydrates the arguments from the session object', () => {

    PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

    let session = getValidSession();

    let rebillBuilder = new RebillHelperController();

    rebillBuilder.parameters.set('session', session);

    return rebillBuilder.hydrateArguments().then(() => {

      expect(rebillBuilder.parameters.store['product_schedules']).to.be.defined;
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

});

/*
deprecated
describe('getProductScheduleProducts', () => {

  xit('successfully acquires the product schedule products', () => {

    let product_schedule = getValidProductSchedule();

    let rebillBuilder = new RebillHelperController();

    rebillBuilder.parameters.set('productschedules', [product_schedule]);
    rebillBuilder.parameters.set('day', 1);

    return rebillBuilder.getProductScheduleProducts().then((result) => {

      let scheduled_products = rebillBuilder.parameters.get('scheduledproducts');

      expect(scheduled_products).to.be.defined;
      expect(scheduled_products[0]).to.deep.equal(product_schedule.schedule[0]);

    });

  });

  xit('successfully acquires the product schedule products', () => {

    let product_schedule = getValidProductSchedule();

    let rebillBuilder = new RebillHelperController();

    rebillBuilder.parameters.set('productschedules', [product_schedule]);
    rebillBuilder.parameters.set('day', -1);

    return rebillBuilder.getProductScheduleProducts().then((result) => {

      let scheduled_products = rebillBuilder.parameters.get('scheduledproducts', null, false);

      expect(scheduled_products).to.not.be.defined;

    });

  });

});

describe('calculateOffsetFromNow', () => {

  it('successfully calculates offset from now', () => {

    let rebillBuilder = new RebillHelperController();

    let buildatoffsets = [-45.8,-1,0,3.9,15,30,45,90,100];

    arrayutilities.map(buildatoffsets, buildatoffset => {

      let rebilldate = rebillBuilder.calculateOffsetFromNow(buildatoffset);
      let correct = timestamp.toISO8601(timestamp.createTimestampSeconds() + (buildatoffset * timestamp.getDayInSeconds()));

      expect(timestamp.isISO8601(rebilldate)).to.be.true;
      expect(rebilldate).to.equal(correct);

    });

  });

  it('fails with invalid inputs', () => {

    let rebillBuilder = new RebillHelperController();

    let invalid_inputs = [null, undefined, {}, [], 'asdbasd', () => {}];

    arrayutilities.map(invalid_inputs, invalid_input => {

      try{
        let rebilldate = rebillBuilder.calculateOffsetFromNow(invalid_input);
      }catch(error){
        expect(error).to.be.defined;
      }

    });

  });

});

describe('calculateDayInCycle', () => {

  it('successfully calculates the day in cycle', () => {

    let rebillBuilder = new RebillHelperController();

    let now = timestamp.createTimestampSeconds();

    let cases = [
      {
        session_start: timestamp.toISO8601(now),
        expect: 0
      },
      {
        session_start: timestamp.toISO8601(now - timestamp.getDayInSeconds()),
        expect: 1
      },
      {
        session_start: timestamp.toISO8601(now - (timestamp.getDayInSeconds() * 5)),
        expect: 5
      },
      {
        session_start: timestamp.toISO8601(now - (timestamp.getDayInSeconds() * 20)),
        expect: 20
      },
      {
        session_start: timestamp.toISO8601(now - (timestamp.getDayInSeconds() * -1)),
        expect: -1
      },
      {
        session_start: timestamp.toISO8601(now),
        expect: 0
      }

    ];

    let session = getValidSession();

    arrayutilities.map(cases, (test_case) => {

      session.created_at = test_case.session_start;

      rebillBuilder.parameters.set('session', session);

      rebillBuilder.calculateDayInCycle(test_case.session_start);
      expect(rebillBuilder.parameters.store['day']).to.equal(test_case.expect);

    });

  });

});

describe('getCurrentRebill', () => {

  xit('successfully calculates returns a proto-rebill for the current cycle', () => {

    let rebillBuilder = new RebillHelperController();

    let product_schedule  = getValidProductSchedule();

    let cases = [
      {
        day: 0,
        expect: product_schedule.schedule[0]
      },
      {
        day: 1,
        expect: product_schedule.schedule[0]
      },
      {
        day:13,
        expect: product_schedule.schedule[0]
      },
      {
        day:14,
        expect: product_schedule.schedule[1]
      },
      {
        day:15,
        expect: product_schedule.schedule[1]
      },
      {
        day:27,
        expect: product_schedule.schedule[1]
      },
      {
        day:28,
        expect: product_schedule.schedule[2]
      },
      {
        day:3000,
        expect: product_schedule.schedule[2]
      }
    ];

    arrayutilities.map(cases, test_case => {

      let current_schedule = rebillBuilder.getCurrentRebill(test_case.day, product_schedule);

      expect(current_schedule.product_schedule).to.deep.equal(product_schedule);
      expect(current_schedule.amount).to.equal(test_case.expect.price);
      expect(current_schedule.product).to.equal(test_case.expect.product_id);

    });

  });

});

describe('getNextRebill', () => {

  xit('successfully calculates returns a proto-rebill for the current cycle', () => {

    let rebillBuilder = new RebillHelperController();

    let product_schedule  = getValidProductSchedule();

    let cases = [
      {
        day: 0,
        expect: product_schedule.schedule[1]
      },
      {
        day: 1,
        expect: product_schedule.schedule[1]
      },
      {
        day:13,
        expect: product_schedule.schedule[1]
      },
      {
        day:14,
        expect: product_schedule.schedule[2]
      },
      {
        day:15,
        expect: product_schedule.schedule[2]
      },
      {
        day:27,
        expect: product_schedule.schedule[2]
      },
      {
        day:28,
        expect: product_schedule.schedule[2]
      },
      {
        day:3000,
        expect: product_schedule.schedule[2]
      }
    ];

    arrayutilities.map(cases, test_case => {

      let next_schedule = rebillBuilder.getNextRebill(test_case.day, product_schedule);

      expect(next_schedule.product_schedule).to.deep.equal(product_schedule);
      expect(next_schedule.amount).to.equal(test_case.expect.price);
      expect(next_schedule.product).to.equal(test_case.expect.product_id);

    });

  });
*/
//});
