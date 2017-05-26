'use strict';

const _ = require("underscore");
const validator = require('validator');

const notificationProvider = global.routes.include('controllers', 'providers/notification/notification-provider');

const du = global.routes.include('lib', 'debug-utilities.js');
const permissionutilities = global.routes.include('lib', 'permission-utilities.js');
const kinesisfirehoseutilities = global.routes.include('lib', 'kinesis-firehose-utilities');

const userController = global.routes.include('controllers', 'entities/User.js');
const affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');

module.exports = class endpointController {

    constructor(parameters){

        if(_.has(parameters, 'required_permissions')){

            this.required_permissions = parameters.required_permissions;

        }

    }

    preprocessing(event){

        du.debug('Preprocessing');

		/*
		*  This method prepares the transactional endpoints to both validate the request and complete necessary actions
		*/

        return this.validateEvent(event)
			.then(this.parseEvent)
			.then(this.acquireAccount)
			.then(this.acquireUser)
			.then((event) => this.validateRequiredPermissions(event));

    }

    validateEvent(event){

        du.debug('Validate Event');

        return new Promise((resolve, reject) => {

            du.highlight('Event:', event);

            if(!_.has(event, 'requestContext')){
                return reject(new Error('Missing requestContext'));
            }

            if(!_.has(event, 'pathParameters')){
                return reject(new Error('Missing pathParameters'));
            }

            return resolve(event);

        });

    }

    parseEvent(event){

        du.debug('Parse Event');

        return new Promise((resolve, reject) => {

            if(!_.isObject(event)){

                try{

                    event = JSON.parse(event.replace(/[\n\r\t]+/g, ''));

                }catch(error){

                    return reject(error);

                }

            }

            if(!_.isObject(event.requestContext)){

                try{

                    event.requestContext = JSON.parse(event.requestContext);

                }catch(error){

                    return reject(error);

                }

            }

            if(!_.isObject(event.pathParameters)){

                try{

                    event.pathParameters = JSON.parse(event.pathParameters);

                }catch(error){

                    return reject(error);

                }

            }

            return resolve(event);

        });

    }

    acquireAccount(event){

        du.debug('Acquire Account');

        return new Promise((resolve, reject) => {

            let pathParameters;
            let account;

            if(_.has(event, "pathParameters")){

                pathParameters = event.pathParameters;

            }else{

                return reject(new Error('Unset pathParameters in the event.'));

            }

            if(_.has(pathParameters, 'account')){

                account = pathParameters.account;

            }else{

                return reject(new Error('Unable to identify account in pathParameters.'));

            }

            if(!_.isString(account)){

                return reject('Unrecognized account format.');

            }

            permissionutilities.setGlobalAccount(account);

            return resolve(event);

        });

    }

    acquireUser(event){

        du.debug('Acquire User');

        return new Promise((resolve, reject) => {

            if(!_.has(event.requestContext, "authorizer")){

                return reject(new Error('Unable to identify the authorizer property in the event request context.'));

            }

            if(!_.has(event.requestContext.authorizer, "user")){

                return reject(new Error('Unable to identify the user node in the event request context authorizer property.'));

            }

            let user_string = event.requestContext.authorizer.user;

            du.debug('Event Request Context Authorizer User Alias:', user_string);

            if(!_.isString(user_string)){

                return reject(new Error('Event request context authorizer user is an unrecognized format.'));

            }

            if(validator.isEmail(user_string)){

                userController.getUserStrict(user_string).then((user) => {

                    if(_.has(user, 'id')){

                        permissionutilities.setGlobalUser(user);

                    }else if(user == false){

                        return reject(new Error('Unknown user.  Please contact the system administrator.'));

                    }

                    return resolve(event);

                }).catch((error) => {

                    return reject(error);

                });

            }else{

                userController.getUserByAlias(user_string).then((user) => {

                    if(_.has(user, 'id')){

                        permissionutilities.setGlobalUser(user);

                    }else if(user == false){

                        return reject(new Error('Unknown user.  Please contact the system administrator.'));

                    }

                    return resolve(event);

                }).catch((error) => {

                    return reject(error);

                });

            }

        });

    }

    handleAffiliateInformation(event){

        du.debug('Handle Affiliate Information');

        if(_.has(event, 'affiliates')){

            let promises = [];
            let assure_array = ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5'];

            for(var i = 0; i < assure_array.length; i++){

                let assurance_field = assure_array[i];

                if(_.has(event.affiliates, assurance_field) && event.affiliates[assurance_field] != ''){

                    promises[i] = affiliateController.assureAffiliate(event.affiliates[assurance_field]);

                }else{

                    promises[i] = Promise.resolve('');

                }

            }

            return Promise.all(promises).then((promises) => {

                for(var i = 0; i < assure_array.length; i++){

                    let assurance_field = assure_array[i];

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

    validateRequiredPermissions(event){

        du.debug('Validate Required Permissions');

        return new Promise((resolve, reject) => {

            permissionutilities.validatePermissionsArray(this.required_permissions).then((permission_object) => {

                du.debug('Permission Object: ', permission_object);

                if(permission_object.has_permission !== true){

                    let error_string = 'Unable to execute action - user lacks permissions: '+permission_object.permission_failures.join(', ');

                    return reject(new Error(error_string));

                }

                return resolve(event);

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    issueNotifications(parameters){

        parameters.account = global.account;

		// No need to validate input as it happens in the utilities.
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

        ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5'].forEach((optional_property) => {
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

    getTransactionSubType(info){

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

    getProcessorResult(info){

        du.debug('Get Processor Result');

        return info.processor.message.toLowerCase();
    }

    getProductSchedule(info){

        du.debug('Get Product Schedule');

        return info.schedulesToPurchase[0].id;

    }

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

        ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5'].forEach((optional_property) => {
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

}
