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

const ProductScheduleHelper = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');

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
          productschedules: 'product_schedules'
        }
      }
    };

    this.parameter_validation = {
      'session': global.SixCRM.routes.path('model','entities/session.json'),
      'day': global.SixCRM.routes.path('model','helpers/rebill/day.json'),
      'billdate':global.SixCRM.routes.path('model', 'definitions/iso8601.json'),
      'nextproductschedulebilldaynumber': global.SixCRM.routes.path('model','helpers/rebill/day.json'),
      'productscheduleids': global.SixCRM.routes.path('model','general/uuidv4list.json'),
      'productschedules': global.SixCRM.routes.path('model','helpers/rebill/productschedules.json'),
      'scheduleelementsonbillday':global.SixCRM.routes.path('model', 'helpers/rebill/scheduledproducts.json'),
      'transactionproducts': global.SixCRM.routes.path('model', 'helpers/rebill/transactionproducts.json'),
      'amount': global.SixCRM.routes.path('model','definitions/currency.json'),
      'rebillprototype': global.SixCRM.routes.path('model', 'helpers/rebill/rebillprototype.json'),
      'rebill': global.SixCRM.routes.path('model', 'entities/rebill.json')
    };

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

  }

  /* Note:  Really, the name of this function should be "createUpcomingRebill"
  If day is -1, the first (initial) element of the product schedule is returned.
  If day is 0, the second element of the product schedule is returned
  In general, this method always returns the next available rebill object from the date that is specified.
  */

  //Technical Debt:  Test this!
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

    du.info(argumentation);

    this.parameters.setParameters({argumentation: argumentation, action: action});

    return Promise.resolve(true);

  }

  //Technical Debt:  Break this function down.
  hydrateArguments(){

    du.debug('Hydrate Arguments');

    let session = this.parameters.get('session');
    let day = this.parameters.get('day', null, false);
    let product_schedule_ids = this.parameters.get('productscheduleids', null, false);

    if(_.isNull(day)){
      this.calculateDayInCycle(session.created_at);
    }

    if(_.isNull(product_schedule_ids)){

      if(!_.has(this, 'sessionController')){
        this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');
      }

      return this.sessionController.listProductSchedules(session)
      .then(results => {
        du.info(results);
        return this.sessionController.getResult(results, 'productschedules')
      })
      .then(product_schedules => {
        if(!_.isNull(product_schedules)){
          this.parameters.set('productschedules', product_schedules);
          return true;
        }
        eu.throwError('server', 'Session does not have product schedules.');
      });

    }else{

      if(!_.has(this, 'productScheduleController')){
        this.productScheduleController = global.SixCRM.routes.include('entities', 'ProductSchedule.js');
      }

      return this.productScheduleController.listProductSchedulesByList({product_schedules: product_schedule_ids})
      .then((product_schedules) => this.productScheduleController.getResult(product_schedules, 'productschedules'))
      .then(product_schedules => {
        //validate that we have them all...
        this.parameters.set('productschedules', product_schedules);

        return true;

      });

    }

  }

  calculateDayInCycle(){

    du.debug('Calculate Day In Cycle');

    let session = this.parameters.get('session');

    let day = timestamp.getDaysDifference(session.created_at);

    this.parameters.set('day', day);

  }

  validateArguments(){

    du.debug('Validate Arguments');

    let product_schedules = this.parameters.get('productschedules');
    let session = this.parameters.get('session');

    if(this.parameters.get('day') < 0){
      du.warning('Creating a rebill object without validating the presence of the product_schedules in the session.');
    }else{
      arrayutilities.map(product_schedules, (product_schedule) => {
        if(!_.contains(session.product_schedules, product_schedule.id)){
          eu.throwError('server', 'The specified product schedule is not contained in the session object: '+product_schedule.id);
        }
      });
    }

    return Promise.resolve(true);

  }

  //Technical Debt:  Test this!
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

    let bill_day = this.parameters.get('nextproductschedulebilldaynumber');

    let session_start = parseInt(timestamp.dateToTimestamp(this.parameters.get('session').created_at));

    let additional_seconds = timestamp.getDayInSeconds() * bill_day;

    let bill_date = timestamp.toISO8601(session_start + additional_seconds);

    du.warning(this.parameters.get('session').created_at+' plus '+bill_day+' days should equal '+bill_date);

    this.parameters.set('billdate', bill_date);

    return Promise.resolve(true);

  }

  buildRebillPrototype(){

    du.debug('Build Rebill Prototype');

    let product_schedule_ids = arrayutilities.map(this.parameters.get('productschedules'), product_schedule => {
      return product_schedule.id;
    })

    let rebill_prototype = {
      parentsession: this.parameters.get('session').id,
      products: this.parameters.get('transactionproducts'),
      bill_at: this.parameters.get('billdate'),
      amount: this.parameters.get('amount'),
      product_schedules: product_schedule_ids
    };

    this.parameters.set('rebillprototype', rebill_prototype);

    return Promise.resolve(true);

  }

  pushRebill(){

    du.debug('Push Rebill');

    if(!_.has(this, 'rebillController')){
      this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    }

    let prototype_rebill = this.parameters.get('rebillprototype');

    return this.rebillController.create({entity: prototype_rebill}).then(rebill => {

      this.parameters.set('rebill', rebill);

      return true;

    });

  }

  returnRebill(){

    du.debug('Return Rebill');

    return Promise.resolve(this.parameters.get('rebill'));

  }

}
