'use strict';
const _ = require("underscore");
const luhn = require("luhn");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const kinesisfirehoseutilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities');
const trackerutilities = global.SixCRM.routes.include('lib', 'tracker-utilities.js');

const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
const notificationProvider = global.SixCRM.routes.include('providers', 'notification/notification-provider');

const authenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/authenticated.js');

module.exports = class transactionEndpointController extends authenticatedController {

    constructor(parameters){

      super(parameters);

      this.setLocalParameters(parameters);

      const AffiliateHelperController = global.SixCRM.routes.include('helpers','entities/affiliate/Affiliate.js');

      this.affiliateHelperController = new AffiliateHelperController();

      const UserEmailHelperController = global.SixCRM.routes.include('controllers', 'helpers/user/Email.js');

      this.userEmailHelperController = new UserEmailHelperController();

    }

    initialize(){

      du.debug('Initialize');

      this.parameters = new Parameters({
        validation: this.parameter_validation,
        definition: this.parameter_definitions
      });

    }

    setLocalParameters(parameters){

        ['notification_parameters'].forEach((local_parameter) => {

            if(_.has(parameters, local_parameter)){

                this[local_parameter] = parameters[local_parameter];

            }

        });

    }

    validateInput(event, validation_function){

        du.debug('Validate Input');

        return new Promise((resolve, reject) => {

            if(!_.isFunction(validation_function)){
                return reject(eu.getError('server', 'Validation function is not a function.'));
            }

            if(_.isUndefined(event)){
                return reject(eu.getError('server', 'Undefined event input.'));
            }

            var params = JSON.parse(JSON.stringify(event || {}));

            let validation = validation_function(params);

            if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

                du.warning(validation);

                return reject(eu.getError(
                  'validation',
                  'One or more validation errors occurred.',
                  {issues: validation.errors.map((e)=>{ return e.message; })}
                ));

            }

            return resolve(params);

        });

    }

    issueNotifications(parameters){

        du.debug('Issue Notifications');

        parameters.account = global.account;

        return notificationProvider.createNotificationsForAccount(parameters);

    }

    pushEventToRedshift(event_type, session, product_schedule){

      du.debug('Push Event to Redshift');

      if(_.isUndefined(product_schedule)){
          product_schedule = '';
      }

      let event = {
          session: session.id,
          type : event_type,
          datetime: session.created_at,
          account: session.account,
          campaign: session.campaign,
          product_schedule: product_schedule
      };

      event = this.affiliateHelperController.transcribeAffiliates(session, event);

      return this.pushRecordToRedshift('events', event).then(() => {

          return session;

      });

    }

    //Deprecated!
    getTransactionSubType(){

        du.debug('Get Transaction Subtype')

        var order_test = /Order/gi;
        var upsell_test = /Upsell/gi;

        if(order_test.test(this.constructor.name)){

            return 'main';

        }

        if(upsell_test.test(this.constructor.name)){

            return 'upsell';

        }

        eu.throwError('server', 'Unrecognized Transaction Subtype');

    }

    pushTransactionToRedshift(info){

      du.debug('Push Transaction to Redshift');

      let transaction = this.createTransactionObject(info);

      return this.pushRecordToRedshift('transactions', transaction).then(() => {

        return info;

      });

    }

    pushRecordToRedshift(table, object){

      return kinesisfirehoseutilities.putRecord(table, object).then((result) => {

        du.output('Kinesis Firehose Result', result);

        return result;

      });

    }

    handleTracking(info){

      du.debug('Handle Tracking');

      return trackerutilities.handleTracking(info.session.id, info).then(() => {

        return info;

      });

    }

    handleEmail(pass_through){

      du.debug('Handle Email');

      return Promise.resolve(pass_through);

    }

    handleNotifications(pass_through){

      du.debug('Handle Notifications');

      return this.issueNotifications(this.notification_parameters).then(() => pass_through);

    }

    validateCreditCard(params){

      if(!luhn.validate(params.creditcard.number)){

        return Promise.reject('Invalid Credit Card number.');

      }

      return Promise.resolve(params);

    }

    sendEmails(event, info){

      du.debug('Send Email');

      return this.userEmailHelperController.sendEmail(event, info).then(() => {

        return Promise.resolve(info);

      }).catch((error) => {

        du.error(error);

        return Promise.resolve(info);

      });

    }

    //Technical Debt:  This needs to be in a helper...
    createEventObject(event, event_type){

      du.debug('Create Event Object');

      let event_object = {
        session: '',
        type : event_type,
        datetime: timestamp.getISO8601(),
        account: global.account,
        campaign: event.campaign,
        product_schedule: ''
      };

      return this.affiliateHelperController.transcribeAffiliates(event.affiliates, event_object);

    }

    //Technical Debt:  This needs to be in a helper...
    createTransactionObject(info){

      du.debug('Create Transaction Object');

      let transaction = {
        id: info.transaction.id,
        datetime: info.transaction.created_at,
        customer: info.customer.id,
        creditcard: info.creditcard.id,
        merchant_provider:info.transaction.merchant_provider,
        campaign:info.campaign.id,
        amount:info.amount,
        processor_result:info.result,
        account:info.transaction.account,
        transaction_type:"new",
        transaction_subtype:this.getTransactionSubType(),
        product_schedules:info.product_schedules,
        //Technical Debt:  Resolve in the AM!
        product_schedule:info.product_schedules[0],
      };

      return this.affiliateHelperController.transcribeAffiliates(info.session, transaction);

    }

}
