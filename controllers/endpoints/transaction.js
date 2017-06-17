'use strict';
const _ = require("underscore");
const luhn = require("luhn");

const du = global.routes.include('lib', 'debug-utilities.js');
const timestamp = global.routes.include('lib', 'timestamp.js');
const kinesisfirehoseutilities = global.routes.include('lib', 'kinesis-firehose-utilities');
const trackerutilities = global.routes.include('lib', 'tracker-utilities.js');

const notificationProvider = global.routes.include('controllers', 'providers/notification/notification-provider');
const affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');
const authenticatedController = global.routes.include('controllers', 'endpoints/authenticated.js');

module.exports = class transactionEndpointController extends authenticatedController {

    constructor(parameters){

        super(parameters);

        du.warning('Instantiate Transaction Controller');

        this.setLocalParameters(parameters);

        this.affiliate_fields = ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5', 'cid'];

        this.userEmailHelperController = global.routes.include('controllers', 'helpers/user/Email.js');

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
                return reject(new Error('Validation function is not a function.'));
            }

            if(_.isUndefined(event)){
                return reject(new Error('Undefined event input.'));
            }

            var params = JSON.parse(JSON.stringify(event || {}));

            let validation = validation_function(params);

            if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

                du.warning(validation);

                var error = {
                    message: 'One or more validation errors occurred.',
                    issues: validation.errors.map((e)=>{ return e.message; })
                };

                return reject(error);

            }

            return resolve(params);

        });

    }

    handleAffiliateInformation(event){

        du.debug('Handle Affiliate Information');

        if(_.has(event, 'affiliates')){

            let promises = [];

            for(var i = 0; i < this.affiliate_fields.length; i++){

                let assurance_field = this.affiliate_fields[i];

                if(_.has(event.affiliates, assurance_field) && event.affiliates[assurance_field] != ''){

                    promises[i] = affiliateController.assureAffiliate(event.affiliates[assurance_field]);

                }else{

                    promises[i] = Promise.resolve('');

                }

            }

            return Promise.all(promises).then((promises) => {

                for(var i = 0; i < this.affiliate_fields.length; i++){

                    let assurance_field = this.affiliate_fields[i];

                    if(_.has(promises[i], 'id')){

                        event.affiliates[assurance_field] = promises[i].id;

                    }else{

                        //event.affiliates[assurance_field] = promises[i];

                    }

                }

                return Promise.resolve(event);

            });

        }

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

        throw new Error('Unrecognized Transaction Subtype');

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

    /*
    sendEmail(event, info){

      return this.userEmailHelperController.sendEmail(event, info.campaign, info).then(() => {

          return Promise.resolve(info);

      });

    }
    */

}
