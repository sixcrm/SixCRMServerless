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
const kinesisfirehoseutilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities');

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
          productscheduleids: 'product_schedules'
        }
      },
      updateRebillState: {
        required: {
          rebill: 'rebill',
          newstate:'new_state'
        },
        optional:{
          errormessage:'error_message',
          previousstate:'previous_state'
        }
      },
      getShippingReceipts:{
        required: {
          rebill: 'rebill'
        },
        optional:{}
      },
      updateRebillProcessing:{
        required: {
          rebill:'rebill',
          processing: 'processing'
        },
        optional:{}
      },
      addRebillToQueue:{
        required:{
          rebill:'rebill',
          queuename:'queue_name'
        },
        optional:{}
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
      'rebill': global.SixCRM.routes.path('model', 'entities/rebill.json'),
      'transformedrebill': global.SixCRM.routes.path('model', 'entities/transformedrebill.json'),
      'billablerebills':global.SixCRM.routes.path('model', 'helpers/rebill/billablerebills.json'),
      'spoofedrebillmessages': global.SixCRM.routes.path('model', 'helpers/rebill/spoofedrebillmessages.json'),
      'queuename': global.SixCRM.routes.path('model', 'workers/queuename.json'),
      'queuemessagebodyprototype': global.SixCRM.routes.path('model','definitions/stringifiedjson.json'),
      'statechangedat': global.SixCRM.routes.path('model','definitions/iso8601.json'),
      'updatedrebillprototype': global.SixCRM.routes.path('model', 'helpers/rebill/updatedrebillprototype.json'),
      'newstate': global.SixCRM.routes.path('model', 'workers/statename.json'),
      'previousstate': global.SixCRM.routes.path('model', 'workers/statename.json'),
      'errormessage': global.SixCRM.routes.path('model', 'helpers/rebill/errormessage.json'),
      'shippingreceipts': global.SixCRM.routes.path('model','entities/components/shippingreceipts.json'),
      'shippingreceiptids': global.SixCRM.routes.path('model','general/uuidv4list.json'),
      'transactions': global.SixCRM.routes.path('model','entities/components/transactions.json')
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

  calculateDayInCycle(created_at){

    du.debug('Calculate Day In Cycle');

    if(_.isUndefined(created_at) || _.isNull(created_at)){

      created_at = null;

      let session = this.parameters.get('session', null, false);

      if(!_.isNull(session)){

        created_at = session.created_at;

      }

    }

    if(timestamp.isISO8601(created_at)){

      let day = timestamp.getDaysDifference(created_at);

      this.parameters.set('day', day);

      return day;

    }

    eu.throwError('server', 'created_at is not a proper ISO-8601');

  }

  validateArguments(){

    du.debug('Validate Arguments');

    let product_schedules = this.parameters.get('productschedules');
    let session = this.parameters.get('session');

    du.info(session, product_schedules);

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
    });

    let rebill_prototype = {
      account: this.parameters.get('session').account,
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

  updateRebillProcessing({rebill, processing}){

    du.debug('Mark Rebill Processing');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'updateRebillProcessing'}))
    .then(() => this.acquireRebill())
    .then(() => this.setRebillProcessing())
    .then(() => this.updateRebill());

  }

  acquireRebill(){

    du.debug('Acquire Rebill');

    let rebill = this.parameters.get('rebill');

    if(!_.has(this, 'rebillController')){
      this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    }

    return this.rebillController.get({id: rebill.id}).then(rebill => {
      this.parameters.set('rebill', rebill);
      return true;
    });

  }

  setRebillProcessing(){

    du.debug('Set Rebill Processing');

    let rebill = this.parameters.get('rebill');
    let processing = this.parameters.get('processing');

    rebill.processing = processing;

    this.parameters.set('rebill', rebill);

    return true;

  }

  updateRebill(){

    du.debug('Update Rebill');

    let rebill = this.parameters.get('rebill');

    if(!_.has(this, 'rebillController')){
      this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    }

    return this.rebillController.update({entity: rebill}).then(rebill => {

      this.parameters.set('rebill', rebill);

      return true;

    });

  }

  updateRebillState({rebill, new_state, previous_state, error_message}){

    du.debug('Updating Rebill State');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'updateRebillState'}))
    .then(() => this.acquireRebill())
    .then(() => this.setConditionalProperties())
    .then(() => this.buildUpdatedRebillPrototype())
    .then(() => this.updateRebillFromUpdatedRebillPrototype())
    .then(() => this.pushRebillStateChangeToRedshift());

  }

  setConditionalProperties(){

    du.debug('Set Conditional Properties');

    if(!this.parameters.isSet('newstate')){
      return true;
    }

    let rebill = this.parameters.get('rebill');

    if(!this.parameters.isSet('previousstate') && !_.isUndefined(rebill.state)){
      this.parameters.set('previousstate', rebill.state);
    }

    return true;

  }

  buildUpdatedRebillPrototype(){

    du.debug('Build Updated Rebill Prototype');

    let rebill = this.parameters.get('rebill');

    this.parameters.set('statechangedat', timestamp.getISO8601());

    rebill.state = this.parameters.get('newstate');
    rebill.state_changed_at = this.parameters.get('statechangedat');
    rebill.history = this.createUpdatedHistoryObjectPrototype();

    //Technical Debt: note that this doesn't appear to be set every time!
    if (this.parameters.isSet('previousstate')) {
      rebill.previous_state = this.parameters.get('previousstate');
    }

    this.parameters.set('updatedrebillprototype', rebill);

    return true;

  }

  createUpdatedHistoryObjectPrototype(){

    du.debug('Create Updated History Object Prototype');

    let rebill = this.parameters.get('rebill');

    if(_.has(rebill, 'history') && arrayutilities.nonEmpty(rebill.history)){

      rebill.history = this.updateHistoryPreviousStateWithNewExit();

    }else{

      rebill.history = [];

    }

    let new_history_element = this.createHistoryElementPrototype({});

    rebill.history.push(new_history_element);

    return rebill.history;

  }

  updateHistoryPreviousStateWithNewExit(){

    du.debug('Update History With New Exit');

    let rebill = this.parameters.get('rebill');

    let last_matching_state = this.getLastMatchingStatePrototype();

    arrayutilities.find(rebill.history, (history_element, index) => {
      if((history_element.state == last_matching_state.state) && (history_element.entered_at == last_matching_state.entered_at)){
        rebill.history[index] = last_matching_state;
      }
    });

    return rebill.history;

  }

  getLastMatchingStatePrototype(){

    du.debug('Get Last Matching State Prototype');

    let rebill = this.parameters.get('rebill');
    let previous_state = this.parameters.get('previousstate');
    let state_changed_at = this.parameters.get('statechangedat');

    let matching_states = arrayutilities.filter(rebill.history, (history_element) => {
      return (history_element.state == previous_state)
    });

    if(!arrayutilities.nonEmpty(matching_states)){

      du.warning('Rebill does not have a history of being in previous state: '+previous_state);

      matching_states.push(this.createHistoryElementPrototype({state: previous_state, entered_at: state_changed_at, error_message: 'Rebill had no previous history of being in this state.'}));

    }

    matching_states = arrayutilities.sort(matching_states, (a, b) => {
      return (a.entered_at - b.entered_at);
    });

    let last_matching_state = matching_states[matching_states.length - 1];

    last_matching_state.exited_at = state_changed_at;

    return last_matching_state;

  }

  createHistoryElementPrototype({state, entered_at, exited_at, error_message}){

    du.debug('Create Rebill History Element Prototype');

    state = (!_.isUndefined(state) && !_.isNull(state))?state:this.parameters.get('newstate');
    entered_at = (!_.isUndefined(entered_at) && !_.isNull(entered_at))?entered_at:this.parameters.get('statechangedat');
    exited_at = (!_.isUndefined(exited_at) && !_.isNull(exited_at))?exited_at:this.parameters.get('exitedat', null, false);
    error_message = (!_.isUndefined(error_message))?error_message:this.parameters.get('errormessage', null, false);

    let history_element = {
      entered_at: entered_at,
      state: state
    };

    if(!_.isNull(error_message)){
      history_element.error_message = error_message;
    }

    if(!_.isNull(exited_at)){
      history_element.exited_at = exited_at;
    }

    return history_element;

  }

  updateRebillFromUpdatedRebillPrototype(){

    du.debug('Update Rebill');

    let updated_rebill_prototype = this.parameters.get('updatedrebillprototype');

    if(!_.has(this, 'rebillController')){
      this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    }

    return this.rebillController.update({entity: updated_rebill_prototype}).then(updated_rebill => {

      this.parameters.set('rebill', updated_rebill);

      return updated_rebill;

    });

  }

  getAvailableRebillsAsMessages(){

    du.debug('Get Available Rebills As Messages');

    return this.getBillableRebills()
    .then(() => this.spoofRebillMessages())
    .then(() => {
      return this.parameters.get('spoofedrebillmessages');
    })

  }

  spoofRebillMessages(){

    du.debug('Spoof Rebill Messages');

    let billable_rebills = this.parameters.get('billablerebills');

    let spoofed_rebill_messages = [];

    if(arrayutilities.nonEmpty(billable_rebills)){

      spoofed_rebill_messages = arrayutilities.map(billable_rebills, rebill => {

        return this.createRebillMessageSpoof(rebill);

      });

    }

    this.parameters.set('spoofedrebillmessages', spoofed_rebill_messages);

    return true;

  }

  createRebillMessageSpoof(rebill){

    du.debug('Create Rebill Message Spoof');

    let body = JSON.stringify({id: rebill.id});

    let spoofed_message = {
      Body: body,
      spoof: true
    };

    return spoofed_message;

  }

  getBillableRebills(){

    du.debug('Get Billable Rebills');

    let now = timestamp.createDate();

    if(!_.has(this, 'rebillController')){
      this.rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
    }

    return this.rebillController.getRebillsAfterTimestamp(now).then(rebills => {

      let billable_rebills = arrayutilities.filter(rebills, (rebill) => {
        if(!_.has(rebill, 'processing') || rebill.processing !== true){
          return true;
        }
        return false;
      })

      this.parameters.set('billablerebills', billable_rebills);

      return true;

    });

  }

  addRebillToQueue({rebill, queue_name}){

    du.debug('Add Rebill To Queue');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'addRebillToQueue'}))
    .then(() => this.acquireRebill())
    .then(() => this.createQueueMessageBodyPrototype())
    .then(() => this.addQueueMessageToQueue());

  }

  addQueueMessageToQueue(){

    du.debug('Add Queue Message To Queue');

    let message_body = this.parameters.get('queuemessagebodyprototype');
    let queue_name = this.parameters.get('queuename');

    this.sqsutilities = global.SixCRM.routes.include('lib', 'sqs-utilities.js');
    return this.sqsutilities.sendMessage({message_body: message_body, queue: queue_name}).then(() => {

        return true;

    });

  }

  createQueueMessageBodyPrototype(){

    du.debug('Create Queue Message Body Prototype');

    let rebill = this.parameters.get('rebill');

    let queue_message_body_prototype = JSON.stringify({
      id: rebill.id
    });

    this.parameters.set('queuemessagebodyprototype', queue_message_body_prototype);

    return true;

  }

  getShippingReceipts({rebill}){

    du.debug('Get Shipping Receipts');

    return Promise.resolve(true)
    .then(() => this.setParameters({argumentation: arguments[0], action: 'getShippingReceipts'}))
    .then(() => this.acquireRebill())
    .then(() => this.acquireTransactions())
    .then(() => this.getShippingReceiptIDs())
    .then(() => this.acquireShippingReceipts())
    .then(() => {
      let shipping_receipts = this.parameters.get('shippingreceipts', null, false);

      if(_.isNull(shipping_receipts)){
        shipping_receipts = [];
      }
      return shipping_receipts;
    });

  }

  acquireTransactions(){

    du.debug('Acquire Transactions');

    let rebill = this.parameters.get('rebill');

    if(!_.has(this, 'rebillController')){
      this.rebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
    }

    return this.rebillController.listTransactions(rebill)
    .then((results) => this.rebillController.getResult(results, 'transactions'))
    .then(transactions => {

      if(!_.isNull(transactions)){
        this.parameters.set('transactions', transactions);
      }

      return true;

    });

  }

  getShippingReceiptIDs(){

    du.debug('Get Shipping Receipt IDs');

    let transactions = this.parameters.get('transactions', null, false);

    if(_.isNull(transactions)){
      return true;
    }

    let shipping_receipt_ids = arrayutilities.map(transactions, transaction => {

      return arrayutilities.map(transaction.products, transaction_product => {

        if(_.has(transaction_product, 'shipping_receipt')){
          return transaction_product.shipping_receipt;
        }

      });

    });

    shipping_receipt_ids = arrayutilities.flatten(shipping_receipt_ids);
    shipping_receipt_ids = arrayutilities.unique(shipping_receipt_ids);
    shipping_receipt_ids = arrayutilities.filter(shipping_receipt_ids, shipping_receipt_id => {
      if(_.isUndefined(shipping_receipt_id) || _.isNull(shipping_receipt_ids)){
        return false;
      }
      return true;
    });

    if(arrayutilities.nonEmpty(shipping_receipt_ids)){
      this.parameters.set('shippingreceiptids', shipping_receipt_ids);
    }

    return true;

  }

  acquireShippingReceipts(){

    du.debug('Acquire Shipping Receipts');

    let shipping_receipt_ids = this.parameters.get('shippingreceiptids', null, false);

    if(_.isNull(shipping_receipt_ids)){
      return true;
    }

    if(!_.has(this, 'shippingReceiptController')){
      this.shippingReceiptController = global.SixCRM.routes.include('entities', 'ShippingReceipt.js');
    }

    return this.shippingReceiptController.getListByAccount({ids: shipping_receipt_ids})
    .then((results) => this.shippingReceiptController.getResult(results))
    .then(shipping_receipts => {

      if(!_.isNull(shipping_receipts)){
        this.parameters.set('shippingreceipts', shipping_receipts);
      }

      return true;

    });

  }

  pushRebillStateChangeToRedshift(){

    du.debug('Pushing Rebill State Change To Redshift');

    return this.transformRebill()
      .then(() => this.pushToRedshift())
      .then(() => this.parameters.get('rebill'))

  }

  transformRebill() {

    const rebill = this.parameters.get('rebill');

    const transformedRebill = {
      id_rebill: rebill.id,
      current_queuename: rebill.state,
      previous_queuename: rebill.previous_state || '',
      account: rebill.account,
      datetime: rebill.state_changed_at
    };

    this.parameters.set('transformedrebill', transformedRebill);

    return Promise.resolve();
  }

  pushToRedshift() {

    const rebill = this.parameters.get('transformedrebill');

    du.debug('Uploading Rebill State Change to Kinesis');

    return kinesisfirehoseutilities.putRecord('rebills', rebill).then(() => {
      du.debug('Rebill State Change Uploaded to Kinesis');

      return Promise.resolve(true);
    })
  }

  /*
  createRebills({session, product_schedules, day_in_cycle}){

    du.debug('Create Rebills');

    if(arrayutilities.nonEmpty(product_schedules)){

      let promises = arrayutilities.map(product_schedules, (product_schedule) => {
        return this.createRebill({session: session, product_schedule: product_schedule, day_in_cycle: day_in_cycle});
      });

      return Promise.all(promises);

    }else{

      return null;

    }

  }
  */
  /*
  createRebill({session, product_schedule, day_in_cycle}){

    du.info(arguments[0]); process.exit();

    du.debug('Create Rebill');

    if(!_.isNumber(day_in_cycle)){

      day_in_cycle = this.calculateDayInCycle(session.created);

    }

    let rebill_parameters = this.calculateRebill({day_in_cycle: day_in_cycle, product_schedule: product_schedule});

    let rebill_prototype = {
        parentsession: session.id,
        bill_at: rebill_parameters.bill_at,
        product_schedules: [product_schedule.id],
        amount: rebill_parameters.amount
    };

    return this.create({entity: rebill_prototype});

  }
  */

  /*
  //Technical Debt:  Clean this up.
  calculateRebill({day_in_cycle, product_schedule}){

    du.debug('Calculate Rebill');

    let calculated_rebill = null;

    arrayutilities.find(product_schedule.schedule, (scheduled_product) => {

      if(parseInt(day_in_cycle) >= parseInt(scheduled_product.start)){

        if(!_.has(scheduled_product, "end") || (parseInt(day_in_cycle) < parseInt(scheduled_product.end))){

          let bill_timestamp = timestamp.createTimestampSeconds() + (scheduled_product.period * timestamp.getDayInSeconds());

          let bill_at = timestamp.toISO8601(bill_timestamp);

          calculated_rebill = {
              product: scheduled_product.product_id,
              bill_at: bill_at,
              amount: scheduled_product.price,
              product_schedule: product_schedule
          };

          return true;

        }

      }

      return false;

    });

    if(_.isNull(calculated_rebill)){

      return calculated_rebill;

    }

    return false;

  }
  */

};
