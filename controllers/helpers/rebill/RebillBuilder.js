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

module.exports = class RebillBuilder {

  constructor(){

  }

  createRebillObject(day_in_cycle, parentsession){

    //look at the parent session
    //for each product schedule
      //get all products available for billing

  }

  buildRebillObject(parameters){

      let rebill_object = {
          bill_at: parameters.bill_at,
          parentsession: parameters.parentsession,
          product_schedules: parameters.product_schedules,
          amount: parameters.amount
      };

      return rebill_object;

  }

  calculateDayInCycle(session_start){

    du.debug('Calculate Day In Cycle');

    return timestamp.getDaysDifference(session_start);

  }

  calculateOffsetFromNow(days_offset){

    du.debug('Calculate Bill At');

    let now_in_seconds = timestamp.createTimestampSeconds();

    let seconds_offset = (days_offset * timestamp.getDayInSeconds());

    return timestamp.toISO8601((now_in_seconds + seconds_offset));

  }

  getScheduleElementByDay(product_schedule, day_in_cycle){

    du.debug('Get Schedule Element By Day');

    let scheduled_element = arrayutilities.find(product_schedule.schedule, (scheduled_product) => {

      if(parseInt(day_in_cycle) >= parseInt(scheduled_product.start)){

        if(!_.has(scheduled_product, "end") || (parseInt(day_in_cycle) < parseInt(scheduled_product.end))){

          return true;

        }

      }

      return false;

    });

    return (_.isUndefined(scheduled_element))?null:scheduled_element;

  }

  calculateRebill(day_in_cycle, product_schedule){

    let calculated_rebill = null;

    let scheduled_product = this.getScheduleElementByDay(product_schedule, day_in_cycle);

    if(!_.isNull(scheduled_product)){

      let bill_at = this.calculateOffsetFromNow(scheduled_product.period);

      calculated_rebill = {
        product: scheduled_product.product_id,
        bill_at: bill_at,
        amount: scheduled_product.price,
        product_schedule: product_schedule
      };

    }

    return calculated_rebill;

  }

  createRebills(session, product_schedules, day_in_cycle){

    du.debug('Create Rebills');

    if(arrayutilities.nonEmpty(product_schedules)){

      let promises = arrayutilities.map(product_schedules, (schedule) => {
        return this.createRebill(session, schedule, day_in_cycle);
      });

      return Promise.all(promises);

    }else{

      return null;

    }

  }

//Technical Debt:  This is a mess
//the product schedule needs to be a part of the rebill, not the product
  createRebill(session, product_schedule, day_in_cycle){

    du.debug('Create Rebill', product_schedule);

    if(!_.isNumber(day_in_cycle)){

      day_in_cycle = this.calculateDayInCycle(session.created);

    }

    var rebill_parameters = this.calculateRebill(day_in_cycle, product_schedule);

    //Technical Debt:  This should use a entity method
    var rebill_object = this.buildRebillObject({
        parentsession: session.id,
        bill_at: rebill_parameters.bill_at,
        product_schedules: [product_schedule.id],
        amount: rebill_parameters.amount
    });

    return this.create({entity: rebill_object});

  }

}
