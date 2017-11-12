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

  constructor(){

  }

  getProductForPurchase(day, schedule){

    du.debug('Get Product For Purchase');

    let return_product;

    schedule.forEach((scheduled_product) => {

      if(parseInt(day) >= parseInt(scheduled_product.start)){

        if(!_.has(scheduled_product, "end")){

          return_product = scheduled_product;

          return true;

        }

        if(parseInt(day) < parseInt(scheduled_product.end)){

          return_product = scheduled_product;

          return true;

        }

      }

    });

    return return_product;

  }

  productSum(day_in_schedule, schedules_for_purchase){

    du.debug('Product Sum');

    let return_amount = 0.0;

    schedules_for_purchase.forEach((schedule) => {

      let product_for_purchase = this.getProductForPurchase(day_in_schedule, schedule.schedule);

      return_amount += parseFloat(product_for_purchase.price);

    });

    return parseFloat(return_amount);

  }

  getSchedule(product_schedule){

    du.debug('Get Schedule');

    if(arrayutilities.nonEmpty(product_schedule.schedule)){

      return arrayutilities.map(product_schedule.schedule, (scheduled_product) => {
        return this.getScheduledProduct(scheduled_product);
      });

    }else{

      return null;

    }

  }

  getScheduledProduct(scheduled_product){

    du.debug('Get Scheduled Product');

    return {
        price: scheduled_product.price,
        start: scheduled_product.start,
        end: scheduled_product.end,
        period: scheduled_product.period,
        product: scheduled_product.product_id
    };

  }

  marryProductsToSchedule(product_schedule, products){

    du.debug('Marry Products To Schedules');

    if(_.has(product_schedule, 'schedule') && arrayutilities.nonEmpty(product_schedule.schedule)){

      if(arrayutilities.nonEmpty(products)){

        for(var i = 0; i < product_schedule.schedule.length; i++){

          arrayutilities.map(products, product => {

            if(product_schedule.schedule[i].product_id == product.id){

              product_schedule.schedule[i].product = product;

              delete product_schedule.schedule[i].product_id;

            }

          });

        }

      }

    }

    return product_schedule;

  }

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

  //Technical Debt: appears to work.
  calculateNextBillingInSchedule({schedule_element, day}){

    du.debug('Calculate Next Billing In Schedule');

    return day + (parseInt(schedule_element.period) - (mathutilities.signIdempotentModulus((parseInt(day) - parseInt(schedule_element.start)), parseInt(schedule_element.period))));

  }

  //Technical Debt: Test
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

}
