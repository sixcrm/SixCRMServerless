'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const mathutilities = global.SixCRM.routes.include('lib', 'math-utilities.js');
const TransactionUtilities = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class ProductScheduleHelper {

  //Tested
  constructor(){

  }

  getProducts({product_schedule}){

    du.debug('Get Products');

  }

  //Tested
  marryProductsToSchedule({product_schedule, products}){

    du.debug('Marry Products To Schedules');

    if(_.has(product_schedule, 'schedule') && arrayutilities.nonEmpty(product_schedule.schedule)){

      if(arrayutilities.nonEmpty(products)){

        arrayutilities.map(product_schedule.schedule, (schedule_element, index) => {

          let found_product = arrayutilities.find(products, product => {

            return (product.id == schedule_element.product);

          });

          if(!_.isNull(found_product)){
            product_schedule.schedule[index].product = found_product;
          }

        });

      }

    }

    return product_schedule;

  }

  //Tested
  getScheduleElementOnDayInSchedule({product_schedule, day}){

    du.debug('Get Schedule Element By Day In Schedule');

    let scheduled_element = arrayutilities.find(product_schedule.schedule, (scheduled_product) => {

      if(parseInt(day) >= parseInt(scheduled_product.start)){

        if(!_.has(scheduled_product, "end") || (parseInt(day) < parseInt(scheduled_product.end))){

          return true;

        }

      }

      return false;

    });

    return (_.isUndefined(scheduled_element))?null:scheduled_element;

  }

  //Tested
  calculateNextBillingInSchedule({schedule_element, day}){

    du.debug('Calculate Next Billing In Schedule');

    return day + (parseInt(schedule_element.period) - (mathutilities.signIdempotentModulus((parseInt(day) - parseInt(schedule_element.start)), parseInt(schedule_element.period))));

  }

  //Tested
  getNextScheduleElement({product_schedule, day}){

    du.debug('Get Next Schedule Element');

    //need to validate?
    //has schedule, is non-empty array

    product_schedule.schedule = arrayutilities.sort(product_schedule.schedule, (a, b) => {
      return (a.start - b.start);
    })

    let next_schedule_element = arrayutilities.find(product_schedule.schedule, (schedule_element, index) => {

      if(_.has(schedule_element, 'end') && this.calculateNextBillingInSchedule({schedule_element: schedule_element, day: day}) > parseInt(schedule_element.end)){
        return false;
      }

      return true;

    });

    if(_.isNull(next_schedule_element) || _.isUndefined(next_schedule_element)){
      du.warning(day, product_schedule.schedule);
    }

    //du.warning(product_schedule.schedule, day);
    //du.info(next_schedule_element);
    //du.info(next_schedule_element);
    return next_schedule_element;

  }

  //Tested
  getNextScheduleElementStartDayNumber({product_schedule, day}){

    du.debug('Get Next Period Day');

    let schedule_element = this.getNextScheduleElement(arguments[0]);

    if(_.has(schedule_element, 'start')){

      if(day < schedule_element.start){
        return schedule_element.start;
      }

      return this.calculateNextBillingInSchedule({schedule_element: schedule_element, day: day});

    }

    return null;

  }

  //Tested
  getTransactionProducts({day, product_schedules}){

    du.debug('Get Transaction Products');

    let transaction_products = [];

    product_schedules.forEach((product_schedule) => {

      let schedule_element = this.getScheduleElementByDay({day: day, schedule: product_schedule.schedule});

      transaction_products.push({
        amount: parseFloat(schedule_element.price),
        product: schedule_element.product
      });

    });

    return transaction_products;

  }

  //Tested
  getScheduleElementByDay({day, schedule}){

    du.debug('Get Schedule Element By Day');

    schedule = arrayutilities.sort(schedule, (a, b) => { return a.start - b.start; });

    let return_product = arrayutilities.find(schedule, (schedule_element) => {

      if(parseInt(day) >= parseInt(schedule_element.start)){

        if(!_.has(schedule_element, "end") || parseInt(day) < parseInt(schedule_element.end)){

          return true;

        }

      }

      return false;

    });

    return return_product;

  }

  /* Deprecated?
  productSum({day, product_schedules}){

    du.debug('Product Sum');

    let return_amount = 0.0;

    arrayutilities.reduce(schedules, (sum, schedule) => {

      let schedule_element = this.getScheduleElementByDay({day: day, schedule: schedule.schedule});

      return_amount += parseFloat(schedule_element.price);

    });

    return parseFloat(return_amount);

  }
  */


  getSchedule({product_schedule}){

    //Note:  This is a graph utility method
    du.debug('Get Schedule');

    if(arrayutilities.nonEmpty(product_schedule.schedule)){

      return arrayutilities.map(product_schedule.schedule, (schedule_element) => {
        return this.transformScheduleElement({schedule_element: schedule_element});
      });

    }else{

      return null;

    }

  }

  //Tested
  transformScheduleElement({schedule_element}){

    du.debug('Get Scheduled Product');

    //Technical Debt:  Use the objectutilities.transcribe method.
    let return_object = {
      price: schedule_element.price,
      start: schedule_element.start,
			period: schedule_element.period,
			//Techincal Debt: accounting for legacy deta, remove at earliest convenience
			product: _.has(schedule_element, 'product') ? schedule_element.product : schedule_element.product_id
		};

    if(_.has(schedule_element, 'end')){
      return_object.end = schedule_element.end;
    }

    return return_object;

  }

}
