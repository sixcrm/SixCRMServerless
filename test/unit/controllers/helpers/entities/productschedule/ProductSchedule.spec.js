'use strict'

const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
let ProductScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');

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

describe('getScheduleElementOnDayInSchedule', () => {

  it('successfully returns schedule elements by day', () => {

    let product_schedule = getValidProductSchedule();

    let productScheduleHelper = new ProductScheduleHelperController();

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

      let scheduled_product = productScheduleHelper.getScheduleElementOnDayInSchedule({product_schedule: product_schedule, day: test_case.day});

      expect(scheduled_product).to.equal(test_case.expect);

    });

  });

});
