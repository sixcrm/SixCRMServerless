'use strict';
const _ = require("underscore");
const luhn = require("luhn");

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const kinesisfirehoseutilities = global.SixCRM.routes.include('lib', 'kinesis-firehose-utilities');
const trackerutilities = global.SixCRM.routes.include('lib', 'tracker-utilities.js');

const notificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider');
const authenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/authenticated.js');

module.exports = class transactionEndpointController extends authenticatedController {

    constructor(parameters){

        super(parameters);

        this.setLocalParameters(parameters);

        this.setUserEmailHelperController();

        this.affiliate_fields = ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5', 'cid'];

        this.affiliateController = global.SixCRM.routes.include('controllers', 'entities/Affiliate.js');

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

    handleAffiliateInformation(event){

      du.debug('Handle Affiliate Information');

      if(_.has(event, 'affiliates')){

        let affiliate_codes = this.extractAffiliateCodes(event);

        if(arrayutilities.nonEmpty(affiliate_codes)){

          return this.affiliateController.assureAffiliates(affiliate_codes).then(affiliates => {

            event = this.replaceAffiliateIDs(event, affiliates);

            this.validateAllAffiliatesReplaced(event);

            return event;

          });

        }


      }else{

        return Promise.resolve(event);

      }

    }

    validateAllAffiliatesReplaced(event){

      du.debug('Validate All Affiliates Replaced');

      arrayutilities.map(this.affiliate_fields, affiliate_field => {
        if(_.has(event.affiliates, affiliate_field)){
          if(!this.affiliateController.isUUID(event.affiliates[affiliate_field])){
            eu.throwError('server', 'Unable to assure '+affiliate_field+': "'+event.affiliates[affiliate_field]+'".');
          }
        }
      });

    }

    replaceAffiliateIDs(event, affiliates){

      du.debug('Replace Affiliate IDs');

      arrayutilities.map(this.affiliate_fields, affiliate_field => {

        if(_.has(event.affiliates, affiliate_field)){

          let assured_affiliate = arrayutilities.find(affiliates, affiliate => {
            return (event.affiliates[affiliate_field] == affiliate.affiliate_id);
          });

          if(!_.isUndefined(assured_affiliate)){
            event.affiliates[affiliate_field] = assured_affiliate.id;
          }

        }

      });

      return event;

    }

    extractAffiliateCodes(event){

      du.debug('Extract Affiliate Codes');

      let affiliate_codes = [];

      if(_.has(event, 'affiliates')){

        arrayutilities.map(this.affiliate_fields, affiliate_field => {
          if(_.has(event.affiliates, affiliate_field)){
            affiliate_codes.push(event.affiliates[affiliate_field]);
          }
        });

      }

      return arrayutilities.unique(affiliate_codes);

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

        this.affiliate_fields.forEach((optional_property) => {
            if(_.has(session, optional_property) && !_.isNull(session[optional_property])){
                event[optional_property] = session[optional_property];
            }else{
                event[optional_property] = '';
            }
        });

        return this.pushRecordToRedshift('events', event).then(() => {

            return session;

        });

    }

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

    //Technical Debt:  Does this go here?
    getProcessorResult(info){

        du.debug('Get Processor Result');

        return info.processor.message.toLowerCase();
    }

    //Technical Debt:  Does this go here?
    getProductSchedule(info){

        du.debug('Get Product Schedule');

        return info.schedulesToPurchase[0].id;

    }

    //Technical Debt:  Does this go here?
    createEventObject(event){

        du.debug('Create Event Object');

        let event_object = {
            session: '',
            type : 'click',
            datetime: timestamp.getISO8601(),
            account: global.account,
            campaign: event.campaign,
            product_schedule: ''
        };

        this.affiliate_fields.forEach((optional_property) => {
            if(_.has(event, 'affiliates') && _.has(event.affiliates, optional_property) && !_.isNull(event.affiliates[optional_property])){
                event_object[optional_property] = event.affiliates[optional_property];
            }else{
                event_object[optional_property] = '';
            }
        });

        return event_object;

    }

    //Technical Debt:  Does this go here?
    createTransactionObject(info){

        du.debug('Create Transaction Object');

        du.warning(info);

        let transaction_subtype = this.getTransactionSubType();
        let processor_result = this.getProcessorResult(info);
        let product_schedule = this.getProductSchedule(info);

        let transaction = {
            id: info.transaction.id,
            datetime: info.transaction.created_at,
            customer: info.customer.id,
            creditcard: info.creditcard.id,
            merchant_provider:info.transaction.merchant_provider,
            campaign:info.campaign.id,
            amount:info.amount,
            processor_result:processor_result,
            account:info.transaction.account,
            transaction_type:"new",
            transaction_subtype:transaction_subtype,
            product_schedule:product_schedule,
        };

        this.affiliate_fields.forEach((optional_property) => {
            if(_.has(info.session, optional_property) && !_.isNull(info.session[optional_property])){
                transaction[optional_property] = info.session[optional_property];
            }else{
                transaction[optional_property] = '';
            }
        });

        return transaction;

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

        du.highlight(info);

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

    setUserEmailHelperController(){

        du.debug('Set User Email Helper Controller');

        let userEmailHelperController = global.SixCRM.routes.include('controllers', 'helpers/user/Email.js');

        this.userEmailHelperController = new userEmailHelperController();

    }

    sendEmails(event, info){

        du.debug('Send Email');

        if(!_.has(this, 'userEmailHelperController')){

            this.setUserEmailHelperController();

        }

        return this.userEmailHelperController.sendEmail(event, info).then(() => {

            return Promise.resolve(info);

        }).catch((error) => {

            du.error(error);

            return Promise.resolve(info);

        });

    }

}
