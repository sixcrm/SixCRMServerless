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

module.exports = class RebillHelper {

  constructor(){

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

  getNextScheduleElementByDay(product_schedule, day_in_cycle){

    du.debug('Get Schedule Element By Day');

    let next_schedule_element = null;

    arrayutilities.find(product_schedule.schedule, (scheduled_product, index, array) => {

      //are we in this scheduled_product's start range?
      if(parseInt(day_in_cycle) >= parseInt(scheduled_product.start)){

        //if the current scheduled product doesn't have an end, well, boom
        if(!_.has(scheduled_product, "end")){

          next_schedule_element = scheduled_product;

          return true;

        //are we in this scheduled_product's end range?
        }else if(parseInt(day_in_cycle) < parseInt(scheduled_product.end)){

          //if there's a product that follows this...
          //Technical Debt:  Note that this assumes ordered product schedules.
          if(!_.isUndefined(product_schedule.schedule[index+1])){

            next_schedule_element = product_schedule.schedule[index+1];

            return true;

          }

        }

      }

      return false;

    });

    return next_schedule_element;

  }

  getCurrentRebill(day_in_cycle, product_schedule){

    let calculated_rebill = null;

    let scheduled_product = this.getScheduleElementByDay(product_schedule, day_in_cycle);

    if(!_.isNull(scheduled_product)){

      //Technical Debt:  It would be nice if this was the beginning of the current cycle, not now.
      let bill_at = this.calculateOffsetFromNow(0);

      calculated_rebill = {
        product: scheduled_product.product_id,
        bill_at: bill_at,
        amount: scheduled_product.price,
        product_schedules: [product_schedule.id]
      };

    }

    return calculated_rebill;

  }

  getNextRebill(day_in_cycle, product_schedule){

    du.debug('Get Next Rebill');

    let calculated_rebill = null;

    let scheduled_product = this.getNextScheduleElementByDay(product_schedule, day_in_cycle);

    if(!_.isNull(scheduled_product)){

      //need this to be days until the next period...
      let bill_at = this.calculateOffsetFromNow(scheduled_product.period);

      calculated_rebill = {
        product: scheduled_product.product_id,
        bill_at: bill_at,
        amount: scheduled_product.price,
        product_schedules: [product_schedule.id]
      };

    }

    return calculated_rebill;

  }

  createInitialRebill(session, product_schedule){

    du.debug('Create Current Rebill');

    let current_rebill_prototype = this.getCurrentRebill(0, product_schedule);

    current_rebill_prototype.parentsession = session.id;

    if(!_.has(this, 'rebillController')){
      this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    }

    return this.rebillController.create({entity: current_rebill_prototype}).then(rebill => {

      return rebill;

    });

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

}
