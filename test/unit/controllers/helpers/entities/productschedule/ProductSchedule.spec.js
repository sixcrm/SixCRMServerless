'use strict'

const _ = require('underscore');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

let ProductScheduleHelperController = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');

function getValidProductSchedules(){

    return [{
      id:uuidV4(),
      name:"Product Schedule 1",
      account:"d3fa3bf3-7824-49f4-8261-87674482bf1c",
      merchantprovidergroup:uuidV4(),
      schedule:[
        {
          product:uuidV4(),
          price:4.99,
          start:0,
          end:14,
          period:14
        },
        {
          product:uuidV4(),
          price:34.99,
          start:14,
          end:28,
          period:14
        },
        {
          product:uuidV4(),
          price:34.99,
          start:28,
          period:28
        }
      ],
      created_at:timestamp.getISO8601(),
      updated_at:timestamp.getISO8601()
    }];

}

function getValidProductSchedule(){

  return getValidProductSchedules()[0];

}

describe('constructor', () => {
  it('successfully constructs', () => {
    let productScheduleHelper = new ProductScheduleHelperController();

    expect(objectutilities.getClassName(productScheduleHelper)).to.equal('ProductScheduleHelper');
  });
});

describe('calculateNextBillingInSchedule', () => {

  it('successfully calculates the next billing in the schedule',  () => {

    let test_cases = [
      {
        schedule_element:{
          start: 0,
          end: 14,
          period: 7
        },
        day: 0,
        expect: 7
      },
      {
        schedule_element:{
          start: 45,
          end: 331,
          period: 91
        },
        day: 22,
        expect: 45
      },
      {
        schedule_element:{
          start: 45,
          end: 331,
          period: 91
        },
        day: 122,
        expect: 136
      },
      {
        schedule_element:{
          start: 45,
          end: 331,
          period: 91
        },
        day: -1,
        expect: 45
      },
      {
        schedule_element:{
          start: 0,
          end: 331,
          period: 91
        },
        day: -1,
        expect: 0
      }
    ];

    let productScheduleHelper = new ProductScheduleHelperController();

    arrayutilities.map(test_cases, test_case => {
      expect(productScheduleHelper.calculateNextBillingInSchedule({schedule_element: test_case.schedule_element, day: test_case.day})).to.equal(test_case.expect);
    });

  });

});

describe('marryProductsToSchedule', () => {

  it('successfully marries products to product schedules', () => {
    let test_cases = [
      {
        products: [
          {
            id:"3ed6a87d-30ea-42ef-963b-9ac6b5d2dde6",
            name:"Product_1"
          },
          {
            id:"868b5200-cd3c-4a88-9877-564995de69ca",
            name:"Product_2"
          },
          {
            id:"e6721cc4-9702-4e2f-bb4f-668abbda6610",
            name:"Product_3"
          }
        ],
        product_schedule: {
          schedule:[
            {
              product:"3ed6a87d-30ea-42ef-963b-9ac6b5d2dde6"
            },
            {
              product:"868b5200-cd3c-4a88-9877-564995de69ca"
            },
            {
              product:"e6721cc4-9702-4e2f-bb4f-668abbda6610"
            }
          ]
        },
        expect: {
          schedule:[
            {
              product: {
                id:"3ed6a87d-30ea-42ef-963b-9ac6b5d2dde6",
                name:"Product_1"
              }
            },
            {
              product: {
                id:"868b5200-cd3c-4a88-9877-564995de69ca",
                name:"Product_2"
              }
            },
            {
              product: {
                id:"e6721cc4-9702-4e2f-bb4f-668abbda6610",
                name:"Product_3"
              }
            }
          ]
        }
      }
    ];

    let productScheduleHelper = new ProductScheduleHelperController();

    arrayutilities.map(test_cases, test_case => {
      expect(productScheduleHelper.marryProductsToSchedule({product_schedule: test_case.product_schedule, products: test_case.products})).to.deep.equal(test_case.expect);
    });
  });

});

describe('getScheduleElementOnDayInSchedule', () => {

  it('successfully returns schedule elements by day', () => {

    let product_schedule = getValidProductSchedule();

    let productScheduleHelper = new ProductScheduleHelperController();

    let cases = [
      {
        day: 0,
        expect: [product_schedule.schedule[0]]
      },
      {
        day: 1,
        expect: [product_schedule.schedule[0]]
      },
      {
        day: -1,
        expect: []
      },
      {
        day: 13,
        expect: [product_schedule.schedule[0]]
      },
      {
        day: 14,
        expect: [product_schedule.schedule[1]]
      },
      {
        day: 15,
        expect: [product_schedule.schedule[1]]
      },
      {
        day: 28,
        expect: [product_schedule.schedule[2]]
      },
      {
        day: 3000,
        expect: [product_schedule.schedule[2]]
      }
    ];

    arrayutilities.map(cases, (test_case) => {

      let scheduled_product = productScheduleHelper.getScheduleElementsOnDayInSchedule({product_schedule: product_schedule, day: test_case.day});

      expect(scheduled_product).to.deep.equal(test_case.expect);

    });

  });

});

describe('getNextScheduleElement', () => {

  it('sucessfully identifies the next schedule element', () => {

    let product_schedules = getValidProductSchedules();
    let test_cases = [
      {
        product_schedule: product_schedules[0],
        day: 0,
        expect: product_schedules[0].schedule[0]
      },
      {
        product_schedule: product_schedules[0],
        day: 3,
        expect: product_schedules[0].schedule[0]
      },
      {
        product_schedule: product_schedules[0],
        day: -1,
        expect: product_schedules[0].schedule[0]
      },
      {
        product_schedule: product_schedules[0],
        day: 13,
        expect: product_schedules[0].schedule[0]
      },
      {
        product_schedule: product_schedules[0],
        day: 14,
        expect: product_schedules[0].schedule[1]
      },
      {
        product_schedule: product_schedules[0],
        day: 15,
        expect: product_schedules[0].schedule[1]
      },
      {
        product_schedule: product_schedules[0],
        day: 27,
        expect: product_schedules[0].schedule[1]
      },
      {
        product_schedule: product_schedules[0],
        day: 28,
        expect: product_schedules[0].schedule[2]
      },
      {
        product_schedule: product_schedules[0],
        day: 29,
        expect: product_schedules[0].schedule[2]
      },
      {
        product_schedule: product_schedules[0],
        day: 3000,
        expect: product_schedules[0].schedule[2]
      }
    ];

    let productScheduleHelper = new ProductScheduleHelperController();

    arrayutilities.map(test_cases, test_case => {
      let next_schedule_element = productScheduleHelper.getNextScheduleElement({product_schedule: test_case.product_schedule, day: test_case.day});

      expect(next_schedule_element).to.deep.equal(test_case.expect);
    });

  });

});

describe('getNextScheduleElementStartDayNumber', () => {

  it('successfully get the next schedule element start day number', () => {

    let product_schedules = getValidProductSchedules();
    let test_cases = [
      {
        product_schedule: product_schedules[0],
        day: 0,
        expect: 14
      },
      {
        product_schedule: product_schedules[0],
        day: -1,
        expect: 0
      },
      {
        product_schedule: product_schedules[0],
        day: 13,
        expect: 14
      },
      {
        product_schedule: product_schedules[0],
        day: 14,
        expect: 28
      },
      {
        product_schedule: product_schedules[0],
        day: 15,
        expect: 28
      },
      {
        product_schedule: product_schedules[0],
        day: 27,
        expect: 28
      },
      {
        product_schedule: product_schedules[0],
        day: 28,
        expect: 56
      },
      {
        product_schedule: product_schedules[0],
        day: 29,
        expect: 56
      },
      {
        product_schedule: product_schedules[0],
        day: 55,
        expect: 56
      },
      {
        product_schedule: product_schedules[0],
        day: 56,
        expect: 84
      },
      {
        product_schedule: product_schedules[0],
        day: 83,
        expect: 84
      },
      {
        product_schedule: product_schedules[0],
        day: 84,
        expect: 112
      }
    ];

    let productScheduleHelper = new ProductScheduleHelperController();

    arrayutilities.map(test_cases, test_case => {
      let next_schedule_element_start_day_number = productScheduleHelper.getNextScheduleElementStartDayNumber({product_schedule: test_case.product_schedule, day: test_case.day});

      expect(next_schedule_element_start_day_number).to.equal(test_case.expect);
    });

  });

  describe('getTransactionProducts', () => {
    it('successfully acquires transaction products', () => {

      let product_schedules = getValidProductSchedules();
      let test_cases = [
        {
          product_schedules:product_schedules,
          day: 0,
          expect:[
            {
              product: product_schedules[0].schedule[0].product,
              amount: product_schedules[0].schedule[0].price,
            }
          ]
        },
        {
          product_schedules:product_schedules,
          day: 1,
          expect:[
            {
              product: product_schedules[0].schedule[0].product,
              amount: product_schedules[0].schedule[0].price,
            }
          ]
        },
        {
          product_schedules:product_schedules,
          day: 14,
          expect:[
            {
              product: product_schedules[0].schedule[1].product,
              amount: product_schedules[0].schedule[1].price,
            }
          ]
        },
        {
          product_schedules:product_schedules,
          day: 28,
          expect:[
            {
              product: product_schedules[0].schedule[2].product,
              amount: product_schedules[0].schedule[2].price,
            }
          ]
        }
      ];

      let productScheduleHelper = new ProductScheduleHelperController();

      arrayutilities.map(test_cases, test_case => {
        let transaction_products = productScheduleHelper.getTransactionProducts({product_schedules: test_case.product_schedules, day: test_case.day});

        expect(transaction_products).to.deep.equal(test_case.expect);
      });

    });

  });

  describe('Get Schedule Element By Day', () => {

    it('successfully acquires the schedule_element for purchase from schedule by day.', () => {

      let product_schedules = getValidProductSchedules();

      let test_cases = [
        {
          schedule: product_schedules[0].schedule,
          day: 0,
          expect:product_schedules[0].schedule[0]
        },
        {
          schedule: product_schedules[0].schedule,
          day: 14,
          expect:product_schedules[0].schedule[1]
        },
        {
          schedule: product_schedules[0].schedule,
          day: 28,
          expect:product_schedules[0].schedule[2]
        },
        {
          schedule: product_schedules[0].schedule,
          day: 56,
          expect:product_schedules[0].schedule[2]
        }
      ];

      let productScheduleHelper = new ProductScheduleHelperController();

      arrayutilities.map(test_cases, test_case => {
        let schedule_element = productScheduleHelper.getScheduleElementByDay({schedule: test_case.schedule, day: test_case.day});

        expect(schedule_element).to.deep.equal(test_case.expect);
      });

    });
  });

  describe('getSchedule', () => {

    it('succesfully acquires the schedule from a product schedule', () => {

      let product_schedules = getValidProductSchedules();

      let productScheduleHelper = new ProductScheduleHelperController();

      arrayutilities.map(product_schedules, product_schedule => {
        let schedule = productScheduleHelper.getSchedule({product_schedule: product_schedule});

        arrayutilities.map(schedule, schedule_element => {
          expect(schedule_element).to.have.property('product');
          expect(schedule_element).to.have.property('start');
          expect(schedule_element).to.have.property('period');
          expect(schedule_element).to.have.property('price');
        });
      });
    });

  });

  describe('transformScheduleElement', () => {
    it('successfully transforms a schedule element', () => {

      let product_schedules = getValidProductSchedules();
      let productScheduleHelper = new ProductScheduleHelperController();

      arrayutilities.map(product_schedules, product_schedule => {
        arrayutilities.map(product_schedule.schedule, schedule_element => {
          let transformed_schedule_element =  productScheduleHelper.transformScheduleElement({schedule_element:schedule_element});

          expect(transformed_schedule_element).to.have.property('product');
          expect(transformed_schedule_element).to.have.property('start');
          expect(transformed_schedule_element).to.have.property('period');
          expect(transformed_schedule_element).to.have.property('price');
          if(_.has(schedule_element, 'end')){
            expect(transformed_schedule_element).to.have.property('end');
          }
        });
      });
    });
  });

});
