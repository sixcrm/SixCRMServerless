'use strict';
const _ = require("underscore");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const modelvalidationutilities = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

var sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
var customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');
var productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');
var campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
var transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');
var creditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
var rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

const RegisterController = global.SixCRM.routes.include('providers', 'register/Register.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/transaction.js');

class createOrderController extends transactionEndpointController{

    constructor(){
        super({
            required_permissions: [
                'user/read',
                'account/read',
                'session/create',
                'session/read',
                'session/update',
                'campaign/read',
                'creditcard/create',
                'creditcard/update',
                'creditcard/read',
                'productschedule/read',
                'loadbalancer/read',
                'rebill/read',
                'rebill/create',
                'rebill/update',
                'product/read',
                'affiliate/read',
                'notification/create',
                'tracker/read'
            ],
            notification_parameters: {
                type: 'order',
                action: 'added',
                title: 'A new order',
                body: 'A new order has been created.'
            }
        });

    }

    execute(event){

      return this.preprocessing((event))
  		.then(this.acquireBody)
  		.then((event) => this.validateInput(event, this.validateEventSchema))
  		.then(this.getOrderInfo)
      .then(this.getOrderCampaign)
      .then(this.validateInfo)
  		.then(this.updateCustomer)
  		.then(this.getTransactionInfo)
  		.then(this.createOrder)
      .then((info) => {
        this.pushToRedshift(info);
        this.handleTracking(info);
        this.postOrderProcessing(info);
        //this.handleNotifications(info);
        return info;
      });

    }

    validateEventSchema(event){

        du.debug('Validate Event Schema');

        return modelvalidationutilities.validateModel(event,  global.SixCRM.routes.path('model', 'endpoints/order.json'));

    }


    getOrderInfo(event_body) {

        du.debug('Get Order Info');

        var promises = [];

        var getSession = sessionController.get({id: event_body.session});
        var getProductSchedules = productScheduleController.listBy({list_array: event_body.product_schedules});
        var getCreditCard	= creditCardController.assureCreditCard(event_body.creditcard);

        promises.push(getSession);
        promises.push(getProductSchedules);
        promises.push(getCreditCard);

        return Promise.all(promises).then((promises) => {

          //du.highlight(promises); process.exit();

          var info = {
            session: promises[0],
            creditcard: promises[2]
          };

          if(_.has(promises[1], 'productschedules')){
            info.productschedules_for_purchase = promises[1].productschedules;
          }

          //du.warning(info); process.exit();
          return info;

        });

    }

    getOrderCampaign(info){

        du.debug('Get Order Campaign');

        if(!_.isObject(info.session)){
            eu.throwError('not_found', 'Unable to identify session.');
        }

        if(!_.has(info.session, 'campaign')){
            eu.throwError('not_found', 'Unable to identify session campaign.');
        }

        return campaignController.getHydratedCampaign(info.session['campaign']).then((campaign) => {

            if(!_.isObject(campaign) || !_.has(campaign, 'id')){

                eu.throwError('not_found', 'Unable to identify session campaign.');

            }

            info['campaign'] = campaign;

            return info;

        });

    }

    validateInfo(info){

      du.debug('Validate Info');

      if(!_.isObject(info.session) || !_.has(info.session, 'id')){
          eu.throwError('not_found', 'Unable to identify session.');
      }

      if(!_.isObject(info.creditcard) || !_.has(info.creditcard, 'id')){
          eu.throwError('not_found', 'Unable to identify credit card.');
      }

      if(info.session.completed == 'true'){
          eu.throwError('bad_request', 'The specified session is already complete.');
      }

      if(!_.isArray(info.productschedules_for_purchase) || (info.productschedules_for_purchase.length < 1)){
          eu.throwError('not_found', 'No available schedules to purchase.');
      }

      arrayutilities.map(info.productschedules_for_purchase, schedule => {
        if(_.isUndefined(schedule) || _.isNull(schedule)){
          eu.throwError('not_found', 'Inappropriate productschedule: '+schedule);
        }
      });

      sessionController.validateProductSchedules(info.productschedules_for_purchase, info.session);

      campaignController.validateProductSchedules(info.productschedules_for_purchase, info.campaign);

      return Promise.resolve(info);

    }

    updateCustomer(info){

      du.debug('Update Customer');

      return customerController.addCreditCard(info.session.customer, info.creditcard).then(() => {

        return info;

      });

    }


    getTransactionInfo(info) {

        du.debug('Get Transaction Info');

        var promises = [];

        var getCustomer = customerController.get({id: info.session.customer});
        //Technical Debt:  Naming convention here could use some work
        var getTransactionProducts = productScheduleController.getTransactionProducts(0, info.productschedules_for_purchase);

		    // Note:  This creates the rebill for NOW such that we have a rebill to append the transaction to.
        var getRebills = rebillController.createRebills(info.session, info.productschedules_for_purchase, 0);

        promises.push(getCustomer);
        promises.push(getTransactionProducts);
        promises.push(getRebills);

        return Promise.all(promises).then((promises) => {

            info.customer = promises[0];
            info.transactionProducts = promises[1];
            info.rebills = promises[2];

			      //more validation
            if(!_.isObject(info.customer) || !_.has(info.customer, 'id')) {
                eu.throwError('not_found', 'Customer not found.');
            }

			      //Technical Debt: refactor this to use the transaction products above....
            info.amount = productScheduleController.productSum(0, info.productschedules_for_purchase);

            return info;

        });

    }

    createOrder(info) {

      du.debug('Create Order');

      let register_promises = arrayutilities.map(info.rebills, rebill => {

        let registerController = new RegisterController();

        return registerController.processTransaction({rebill: rebill});

      });

      return Promise.all(register_promises).then(register_promises => {

        du.warning(register_promises); process.exit();

      });

    }

    postOrderProcessing(info) {

        du.debug('Post Order Processing');

		//Technical Debt: this looks like a hack as well
        var transactions = [info.transaction.id];

		//Technical Debt: hack, we need to support multiple schedules in a single order
        var rebill = info.rebills[0];

        du.info(rebill);

        var promises = [];
        var addRebillToQueue = rebillController.addRebillToQueue(rebill, 'hold');
        var updateSession = sessionController.updateSessionProductSchedules(info.session, info.productschedules_for_purchase);
        var rebillUpdates = rebillController.updateRebillTransactions(rebill, transactions);

		    //Technical Debt:  This is deprecated.  Instead, add the session id object to the rebill queue
        //var createNextRebills = rebillController.createRebills(info.session, info.productschedules_for_purchase);

        promises.push(addRebillToQueue);
        //promises.push(createNextRebills);
        promises.push(updateSession);
        promises.push(rebillUpdates);

        return Promise.all(promises).then(() => {

          //Technical Debt: add some validation here...
          //var rebills_added_to_queue = promises[0];
          //var next_rebills = promises[1];
          //var updated_session = promises[2];
          //var updateRebills = promises[3];

            return info.transaction;

        });

    }

    pushToRedshift(info){

        du.debug('Push To Redshift');

        let promises = [];

        promises.push(this.pushEventsRecord(info));
        promises.push(this.pushTransactionsRecord(info));

        return Promise.all(promises).then(() => {

            return info;

        });

    }

    pushEventsRecord(info){

        du.debug('Push Events Record');

        let product_schedule = info.productschedules_for_purchase[0].id;

        return this.pushEventToRedshift('order', info.session, product_schedule).then(() => {

            return info;

        });

    }

    pushTransactionsRecord(info){

        du.debug('Push Transactions Record');

        return this.pushTransactionToRedshift(info).then(() => {

            return info;

        });

    }

}

module.exports = new createOrderController();
