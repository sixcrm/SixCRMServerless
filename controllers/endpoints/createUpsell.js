'use strict';
const _ = require("underscore");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const modelvalidationutilities = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

var sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
var customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');
var productScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');
var campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
var transactionController = global.SixCRM.routes.include('controllers', 'entities/Transaction.js');
var rebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');
const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/transaction.js');

const processHelperController = global.SixCRM.routes.include('helpers', 'transaction/Process.js');

/*
* Push the pingback to the transaction
* Pingback parsing and execution
* Push the Redshift rows (Event and Transaction)
*/

class createUpsellController extends transactionEndpointController{

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
                title: 'A new order (upsell)',
                body: 'A new order (upsell) has been created.'
            }
        });

    }

    execute(event){

        return this.preprocessing((event))
  		.then(this.acquireBody)
  		.then((event) => this.validateInput(event, this.validateEventSchema))
  		.then(this.getUpsellProperties)
  		.then(this.getUpsellAssociatedProperties)
  		.then(this.getTransactionInfo)
  		.then(this.createUpsell)
      .then(info => {
         this.pushToRedshift(info);
         this.postUpsellProcessing(info);
         this.handleNotifications(info);
         return info;
      });


    }

    validateEventSchema(event){

        du.debug('Validate Event Schema');

        return modelvalidationutilities.validateModel(event,  global.SixCRM.routes.path('model', 'endpoints/upsell.json'));

    }

    getUpsellProperties(event_body){

        du.debug('Get Upsell Properties');

        var promises = [];

        var getSession = sessionController.get({id: event_body['session']});
        var getProductSchedules = productScheduleController.getProductSchedules(event_body['product_schedules']);

        du.debug('Product Schedules', event_body['product_schedules']);
        du.debug(getProductSchedules);

        promises.push(getSession);
        promises.push(getProductSchedules);

        return Promise.all(promises).then((promises) => {

            var info = {
                session: promises[0],
                campaign:  {},
                schedulesToPurchase: promises[1],
                creditcard: {}
            };

            du.debug('Info Object:', info);

            if(!_.isObject(info.session) || !_.has(info.session, 'id')){
                eu.throwError('not_found', 'No available session.');
            }

            if(info.session.completed == 'true'){
                eu.throwError('bad_request', 'The specified session is already complete.');
            }

            if(!_.isArray(info.schedulesToPurchase) || (info.schedulesToPurchase.length < 1)){
                eu.throwError('not_found', 'No available schedules to purchase.');
            }

            sessionController.validateProductSchedules(info.schedulesToPurchase, info.session);

            return info;

        });

    }

    getUpsellAssociatedProperties(info){

        du.debug('Get Associated Upsell Properties');

        var promises = [];

        var getCampaign = campaignController.getHydratedCampaign(info.session.campaign);
        var getCreditCard = sessionController.getSessionCreditCard(info.session);

        promises.push(getCampaign);
        promises.push(getCreditCard);

        return Promise.all(promises).then((promises) => {

            info['campaign'] = promises[0];
            info['creditcard'] = promises[1];

            du.debug('Info', info);

            if(!_.isObject(info.campaign) || !_.has(info.campaign, 'id')){
       			 	eu.throwError('not_found', 'No available campaign.');
            }

            if(!_.isObject(info.creditcard) || !_.has(info.creditcard, 'id')){
 			 	      eu.throwError('not_found', 'No available creditcard.');
            }

            campaignController.validateProductSchedules(info.schedulesToPurchase, info.campaign);

            return info;

        });

    }

    getTransactionInfo(info) {

        du.debug('Get Transaction Info');

        var promises = [];

        var getCustomer = customerController.get({id:info.session.customer});
        var getTransactionProducts = productScheduleController.getTransactionProducts(0, info.schedulesToPurchase);
        var getRebills = rebillController.createRebills(info.session, info.schedulesToPurchase, 0);

        promises.push(getCustomer);
        promises.push(getTransactionProducts);
        promises.push(getRebills);

        return Promise.all(promises).then((promises) => {

            info.customer = promises[0];
            info.transactionProducts = promises[1];
            info.rebills = promises[2];

			//more validation
            if(!_.isObject(info.customer) || !_.has(info.customer, 'id')) {
 			 	       eu.throwError('not_found', 'No available customer.');
            }

			//Technical Debt: refactor this to use the transaction products above....
            info.amount = productScheduleController.productSum(0, info.schedulesToPurchase);

            return info;

        });

    }

    createUpsell(info) {

      du.debug('Create Upsell');

      let ph = new processHelperController();

      //Technical Debt:  Assumes a single schedule for purchase
      let productschedule = info.schedulesToPurchase[0];

      return ph.process({customer: info.customer, productschedule: productschedule, amount:info.amount}).then((result) => {

        //Technical Debt:  Deprecated
        //CRITICAL
        if(!_.has(result, "code") || result.code !== 'success' || !_.has(result, "result")){

          eu.throwError('server', 'The processor didn\'t approve the transaction: ' + result.message);

        }

        info.processor = result;

        return transactionController.putTransaction({session: info.session, rebill: info.rebills[0], amount: info.amount, products: info.transactionProducts}, result).then((transaction) => {

          //Techincal Debt: validate transaction above

          info.transaction = transaction;

          du.debug('Info:', info);

          return info;

        });

      });

    }

    pushEventsRecord(info){

        du.debug('Push Events Record');

        let product_schedule = info.schedulesToPurchase[0].id;

        return this.pushEventToRedshift('order', info.session, product_schedule).then(() => {

            du.info(info);

            return info;

        });

    }

    pushTransactionsRecord(info){

        du.debug('Push Transactions Record');

        return this.pushTransactionToRedshift(info).then(() => {

            du.info(info);

            return info;

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

    postUpsellProcessing(info) {

        du.debug('Post Upsell Processing');

		//Technical Debt: this looks like a hack as well
        var transactions = [info.transaction.id];

		//Technical Debt: hack, we need to support multiple schedules in a single upsell
        var rebill = info.rebills[0];

        var promises = [];
        var addRebillToQueue = rebillController.addRebillToQueue(rebill, 'hold');
        var updateSession = sessionController.updateSessionProductSchedules(info.session, info.schedulesToPurchase);
        var rebillUpdates = rebillController.updateRebillTransactions(rebill, transactions);

		//Technical Debt:  This is deprecated.  Instead, add the session id object to the rebill queue
		//var createNextRebills = rebillController.createRebills(info.session, info.schedulesToPurchase);

        promises.push(addRebillToQueue);
		//promises.push(createNextRebills);
        promises.push(updateSession);
        promises.push(rebillUpdates);

        return Promise.all(promises).then(() => {

          //var rebills_added_to_queue = promises[0];
		      //var next_rebills = promises[1];
          //var updated_session = promises[2];
          //var updateRebills = promises[3];

		      //add some validation here...

          return info.transaction;

        });

    }

}

module.exports = new createUpsellController();
