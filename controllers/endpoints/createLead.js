'use strict';
const _ = require('underscore');
const validator = require('validator');
const Validator = require('jsonschema').Validator;

const du = global.routes.include('lib', 'debug-utilities.js');
const notificationProvider = global.routes.include('controllers', 'providers/notification/notification-provider');

var customerController = global.routes.include('controllers', 'entities/Customer.js');
var affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');
var campaignController = global.routes.include('controllers', 'entities/Campaign.js');
var sessionController = global.routes.include('controllers', 'entities/Session.js');
var endpointController = global.routes.include('controllers', 'endpoints/endpoint.js');

/*
* Push the Redshift row (Click)
*/

class createLeadController extends endpointController{

    constructor(){
        super({
            required_permissions: [
                'user/read',
                'account/read',
                'customer/read',
                'customer/create',
                'customer/update',
                'session/create',
                'session/update',
                'session/read',
                'campaign/read',
                'affiliate/read',
                'affiliate/create',
                'notification/create'
            ]
        });

        this.notification_parameters = {
            type: 'lead',
            action: 'created',
            title:  'New Lead',
            body: 'A new lead has been created.'
        };

    }

    execute(event){

        du.debug('Execute');

        return this.preprocessing((event))
  			.then((event) => this.acquireBody(event))
  			.then((event) => this.validateInput(event))
  			.then((event) => this.assureCustomer(event))
        .then((event) => this.handleAffiliateInformation(event))
        .then((event) => this.handleTrackbackInformation(event))
  			.then((event) => this.createSessionObject(event))
  			.then((session_object) => this.persistSession(session_object))
  			.then((session_object) => this.handleNotifications(session_object));

    }

    acquireBody(event){

        du.debug('Acquire Body');

        var duplicate_body;

        try {
            duplicate_body = JSON.parse(event['body']);
        } catch (e) {
            duplicate_body = event.body;
        }

        return Promise.resolve(duplicate_body);

    }

    validateInput(event){

        du.debug('Validate Input');

        return new Promise((resolve, reject) => {

            var lead_schema;
            var customer_schema;
            var address_schema;
            var creditcard_schema;
            var affiliates_schema;

            try{

                lead_schema = global.routes.include('model', 'endpoints/lead');
                customer_schema = global.routes.include('model', 'general/customer');
                address_schema = global.routes.include('model', 'general/address');
                creditcard_schema = global.routes.include('model', 'general/creditcard');
                affiliates_schema = global.routes.include('model', 'endpoints/affiliates');

            } catch(e){

                return reject(new Error('Unable to load validation schemas.'));

            }

            var validation;
            var params = JSON.parse(JSON.stringify(event || {}));

            try{
                var v = new Validator();

                v.addSchema(address_schema, '/Address');
                v.addSchema(creditcard_schema, '/CreditCard');
                v.addSchema(affiliates_schema, '/Affiliates');
                v.addSchema(customer_schema, '/Customer');
                validation = v.validate(params, lead_schema);

            }catch(e){
                return reject(new Error('Unable to instantiate validator.'));
            }

            if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){

                du.warning(validation);

                var error = {
                    message: 'One or more validation errors occurred.',
                    issues: validation.errors.map((e)=>{ return e.message; })
                };

                return reject(error);

            }

            return resolve(params)

        });

    }

    //Technical Debt:  Streamline to add hydrated model to the event object
    assureCustomer(event){

        du.debug('Assure Customer');

        return new Promise((resolve, reject) => {

            customerController.getCustomerByEmail(event.customer.email).then((customer) => {

                if(!_.has(customer, 'id')){

                    return customerController.create(event.customer).then((created_customer) => {

                        if(_.has(created_customer, 'id')){

                            return resolve(event);

                        }

                        return reject(new Error('Unable to create a new customer.'));

                    }).catch((error) => {

                        return reject(error);

                    });

                }else{

                    return resolve(event);

                }

            }).catch((error) => {

                return reject(error);

            });

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

    //Technical Debt: Complete!
    handleTrackbackInformation(event){

        du.debug('Handle Trackback Information');

        return Promise.resolve(event);

    }

    createSessionObject(event){

        du.debug('Create Session Object');

        return new Promise((resolve, reject) => {

            var promises = [];

            var getCampaign = campaignController.get(event.campaign);
            var getCustomer = customerController.getCustomerByEmail(event.customer.email);

            promises.push(getCampaign);
            promises.push(getCustomer);

            return Promise.all(promises).then((promises) => {

                let campaign = promises[0];
                let customer = promises[1];

                if(!_.has(campaign, 'id')){ return reject(new Error('A invalid campaign id is specified.')); }

                if(!_.has(customer, "id")){ return reject(new Error('A invalid customer id is specified.')); }

                let session_object = {
                    customer: customer.id,
                    campaign: campaign.id,
                };

                ['affiliate', 'subaffiliate_1', 'subaffiliate_2', 'subaffiliate_3', 'subaffiliate_4', 'subaffiliate_5'].forEach((affiliate_field) => {

                    if(_.has(event, 'affiliates') && _.has(event.affiliates, affiliate_field)){

                        if(!_.isNull(event.affiliates[affiliate_field])){

                            session_object[affiliate_field] = event.affiliates[affiliate_field];

                        }

                    }

                });

                return resolve(session_object);

            });

        });

    }

    persistSession(session_object){

        du.debug('Persist Session');

        du.warning('Session Object: ', session_object);

        return new Promise((resolve, reject) => {

            sessionController.putSession(session_object).then((session) => {

                return resolve(session);

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    handleNotifications(pass_through){

        du.warning('Handle Notifications');

        return this.issueNotifications(this.notification_parameters).then(() => pass_through);

    }

}

module.exports = new createLeadController();
