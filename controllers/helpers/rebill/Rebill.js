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

const ProductScheduleHelper = global.SixCRM.routes.include('helpers', 'productschedule/ProductSchedule.js');

module.exports = class RebillHelper {

  //Need cases:  Transactional Endpoint:
  /*
    It's the first moment after someone has agreed to a session productschedule and I'm trying to bill them
    but I need a rebill in the database first
     - createRebill(session, 0)
     --note that this creates all rebills for the session, optionally add a product_schedule?
    The session has come through the createRebillQueue and I need to create the next rebills for the session
     - createRebill(session)
  */

  constructor(){

    this.parameter_definition = {
      createRebill: {
        required:{
          session:'session'
        },
        optional:{
          day:'day',
          product_schedules: 'product_schedules'
        }
      }
    };

    this.parameter_validation = {
      'session': global.SixCRM.routes.path('model','entities/session.json'),
      'day': global.SixCRM.routes.path('model','helpers/rebill/day.json'),
      'nextproductschedulebilldaynumber': global.SixCRM.routes.path('model','helpers/rebill/day.json'),
      'productschedules': global.SixCRM.routes.path('model','helpers/rebill/productschedules.json'),
      'scheduleelementsonbillday':global.SixCRM.routes.path('model', 'helpers/rebill/scheduledproducts.json'),
      'transactionproducts': global.SixCRM.routes.path('model', 'helpers/rebill/transactionproducts.json'),
      'amount': global.SixCRM.routes.path('model','definitions/currency.json')
    };

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

  }

  /* Note:  Really, the name of this function should be "createUpcomingRebill"
  If day is -1, the first (initial) element of the product schedule is returned.
  If day is 0, the second element of the product schedule is returned
  In general, this method always returns the next available rebill object from the date that is specified.
  */

  createRebill({session, day, product_schedules}){

    du.debug('Create Rebill');

    return this.setParameters({argumentation: arguments[0], action: 'createRebill'})
    .then(() => this.hydrateArguments())
    .then(() => this.validateArguments())
    .then(() => this.acquireRebillProperties())
    .then(() => this.buildRebillPrototype())
    .then(() => this.pushRebill())
    .then(() => this.returnRebill());

  }

  setParameters({argumentation, action}){

    du.debug('Set Parameters');

    this.parameters.setParameters({argumentation: argumentation, action: action});

    return Promise.resolve(true);

  }

  hydrateArguments(){

    du.debug('Hydrate Arguments');

    let session = this.parameters.get('session');
    let day = this.parameters.get('day', null, false);
    let product_schedules = this.parameters.get('productschedules', null, false);

    if(_.isNull(day)){
      this.calculateDayInCycle(session.created_at);
    }

    if(_.isNull(product_schedules)){

      if(!_.has(this, 'sessionController')){
        this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');
      }

      return this.sessionController.listProductSchedules(session)
      .then(results => this.sessionController.getResult(results, 'productschedules'))
      .then(product_schedules => {
        if(!_.isNull(product_schedules)){
          this.parameters.set('productschedules', product_schedules);
          return true;
        }
        eu.throwError('server', 'Session does not have product schedules.');
      });

    }

    return Promise.resolve(true);

  }

  validateArguments(){

    du.debug('Validate Arguments');

    let product_schedules = this.parameters.get('productschedules');
    let session = this.parameters.get('session');

    arrayutilities.map(product_schedules, (product_schedule) => {
      if(!_.contains(session.product_schedules, product_schedule.id)){
        eu.throwError('server', 'The specified product schedule is not contained in the session object: '+product_schedule.id);
      }
    });

    return Promise.resolve(true);

  }

  acquireRebillProperties(){

    du.debug('Acquire Rebill Properties');

    return this.getNextProductScheduleBillDayNumber()
    .then(() => this.getScheduleElementsOnBillDay())
    .then(() => this.getScheduleElementsProducts())
    .then(() => this.calculateAmount())
    .then(() => this.calculateBillAt());

  }

  getNextProductScheduleBillDayNumber(){

    du.debug('Get Next Product Schedule Schedule Element Start Day Number');

    let day = this.parameters.get('day');
    let product_schedules = this.parameters.get('productschedules');

    if(!_.has(this, 'productScheduleHelper')){
      this.productScheduleHelper = new ProductScheduleHelper();
    }

    let start_day_numbers = arrayutilities.map(product_schedules, product_schedule => {
      return this.productScheduleHelper.getNextScheduleElementStartDayNumber({day: day, product_schedule: product_schedule});
    });

    start_day_numbers =  arrayutilities.filter(start_day_numbers, start_day_number => {
      return numberutilities.isInteger(start_day_number);
    });

    let next_schedule_element_start_day_number = arrayutilities.reduce(start_day_numbers, (min, value) => {

      if(!numberutilities.isInteger(min)){
        return value;
      }

      if(value < min){
        return value;
      }

      return min;

    }, null);

    if(!_.isNull(next_schedule_element_start_day_number)){

      this.parameters.set('nextproductschedulebilldaynumber', next_schedule_element_start_day_number);

      return Promise.resolve(true);

    }

    //Note:  Null means that we don't have any more billings available to this collection of product schedules.
    return Promise.resolve(false);

  }

  getScheduleElementsOnBillDay(){

    du.debug('Get Schedule Elements On Bill Day');

    let product_schedules = this.parameters.get('productschedules');
    let bill_day = this.parameters.get('nextproductschedulebilldaynumber');

    if(!_.has(this, 'productScheduleHelper')){
      this.productScheduleHelper = new ProductScheduleHelper();
    }

    let schedule_elements = arrayutilities.map(product_schedules, product_schedule => {
      return this.productScheduleHelper.getScheduleElementOnDayInSchedule({day: bill_day, product_schedule: product_schedule});
    });

    schedule_elements = arrayutilities.filter(schedule_elements, (schedule_element) => {
      return objectutilities.isObject(schedule_element);
    })

    if(arrayutilities.nonEmpty(schedule_elements)){
      this.parameters.set('scheduleelementsonbillday', schedule_elements);
      return Promise.resolve(true);
    }

    return Promise.resolve(false);

  }

  getScheduleElementsProducts(){

    du.debug('Get Schedule Elements Products');

    let schedule_elements = this.parameters.get('scheduleelementsonbillday', null, false);

    if(arrayutilities.nonEmpty(schedule_elements)){

      let products = arrayutilities.map(schedule_elements, schedule_element => {

        return {product: schedule_element.product_id, amount: schedule_element.price};

      });

      this.parameters.set('transactionproducts', products);

      return Promise.resolve(true);

    }

    return Promise.resolve(false);

  }

  calculateAmount(){

    du.debug('Calculate Amount');

    let products = this.parameters.get('transactionproducts', null, false);

    let amount = arrayutilities.reduce(products, (sum, object) => {
      return (parseFloat(sum) + parseFloat(object.amount));
    });

    this.parameters.set('amount', amount);

    return Promise.resolve(true);

  }

  calculateBillAt(){

    du.debug('Calculate Bill At');

  }

  /*
  returnRebill(){

    du.debug('Return Rebill');

    return this.parameters.get('rebill');

  }

  getUpcomingProductSchedulesScheduleItemProducts(){

    du.debug('Get Upcoming Product Schedule Schedule Item Products');

    let day = this.parameters.get('nextproductschedulebilldaynumber');

    let product_schedules = this.parameters.get('productschedules');

    if(!_.has(this, 'productScheduleHelper')){
      this.productScheduleHelper = new ProductScheduleHelper();
    }

    let products = arrayutilities.map(product_schedules, product_schedule => {
      return this.productScheduleHelper.getScheduleElementByDayInSchedule(product_schedule, day);
    });

    products = arrayutilities.filter(products, product => {
      return objectutilities.isObject(product);
    });

    if(arrayutilities.nonEmpty(products)){

      this.parameters.set('scheduledproducts', products);

      return Promise.resolve(products);

    }

    du.warning('No products associated with product schedule for day '+day);

    return Promise.resolve(null);

  }

  buildRebillPrototype(){

    du.debug('Build Rebill Prototype');

  }

  pushRebill(){

    du.debug('Push Rebill');

    let rebill_prototype = this.parameters.get('rebillprototype');

    if(!_.has(this, 'rebillController')){
      this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    }

    return this.rebillController.create({entity: rebill_prototype}).then(result => {
      this.parameters.set('rebill', rebill);
      return true;
    });

  }

  calculateDayInCycle(){

    du.debug('Calculate Day In Cycle');

    let session = this.parameters.get('session');

    let day = timestamp.getDaysDifference(session.created_at);

    this.parameters.set('day', day);

  }


calculateOffsetFromNow(days_offset){

  du.debug('Calculate Bill At');

  let now_in_seconds = timestamp.createTimestampSeconds();

  let seconds_offset = (days_offset * timestamp.getDayInSeconds());

  return timestamp.toISO8601((now_in_seconds + seconds_offset));

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


    /*
    //Technical Debt:  THis is poorly named
    getTransactionProducts(day_in_schedule, schedules_to_purchase){

      du.debug('Get Transaction Products');

      let transaction_products = [];

      arrayutilities.map(schedules_to_purchase, (schedule) => {

        let product_for_purchase = this.getProductForPurchase(day_in_schedule, schedule.schedule);

        transaction_products.push({
          amount: parseFloat(product_for_purchase.price),
          //Technical Debt: "product_id" is bad nomenclature
          product: product_for_purchase.product_id
        });

      });

      return transaction_products;

    }
    */

}
