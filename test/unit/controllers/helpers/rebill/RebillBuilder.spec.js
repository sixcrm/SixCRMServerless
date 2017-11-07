'use strict'

const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

let expect = chai.expect;
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
let timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
let mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

let RebillHelperController = global.SixCRM.routes.include('helpers', 'rebill/Rebill.js');

function getValidProductSchedule(){

  return {
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
  };

}

describe('constructor', () => {

  it('successfully calls the constructor', () => {
    let rebillBuilder = new RebillHelperController();

    expect(objectutilities.getClassName(rebillBuilder)).to.equal('RebillHelper');
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

describe('getScheduleElementByDay', () => {

  it('successfully returns schedule elements by day', () => {

    let product_schedule = getValidProductSchedule();

    let rebillBuilder = new RebillHelperController();

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
        day: -1,
        expect: null
      },
      {
        day: 13,
        expect: product_schedule.schedule[0]
      },
      {
        day: 14,
        expect: product_schedule.schedule[1]
      },
      {
        day: 15,
        expect: product_schedule.schedule[1]
      },
      {
        day: 28,
        expect: product_schedule.schedule[2]
      },
      {
        day: 3000,
        expect: product_schedule.schedule[2]
      }
    ];

    arrayutilities.map(cases, (test_case) => {

      let scheduled_product = rebillBuilder.getScheduleElementByDay(product_schedule, test_case.day);

      expect(scheduled_product).to.equal(test_case.expect);

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

    arrayutilities.map(cases, (test_case) => {

      expect(rebillBuilder.calculateDayInCycle(test_case.session_start)).to.equal(test_case.expect);

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

});
