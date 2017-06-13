'use strict';
const _ = require('underscore');
const Validator = require('jsonschema').Validator;

const du = global.routes.include('lib', 'debug-utilities.js');

var customerController = global.routes.include('controllers', 'entities/Customer.js');
var campaignController = global.routes.include('controllers', 'entities/Campaign.js');
var sessionController = global.routes.include('controllers', 'entities/Session.js');
const transactionEndpointController = global.routes.include('controllers', 'endpoints/transaction.js');

class createLeadController extends transactionEndpointController{

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
                'notification/create',
                'tracker/read'
            ],
            notification_parameters: {
                type: 'lead',
                action: 'created',
                title:  'New Lead',
                body: 'A new lead has been created.'
            }
        });

    }

    execute(event){

        du.debug('Execute');

        return this.preprocessing((event))
  			.then((event) => this.acquireBody(event))
  			.then((event) => this.validateInput(event, this.validateEventSchema))
  			.then((event) => this.assureCustomer(event))
        .then((event) => this.handleAffiliateInformation(event))
  			.then((event) => this.createSessionObject(event))
  			.then((session_object) => this.persistSession(session_object))
        .then((session_object) => this.handleLeadTracking(session_object, event))
        .then((session_object) => this.pushToRedshift(session_object))
  			.then((session_object) => this.handleNotifications(session_object));

    }

    validateEventSchema(event){

        du.debug('Validate Event Schema');

        let lead_schema = global.routes.include('model', 'endpoints/lead');
        let customer_schema = global.routes.include('model', 'endpoints/components/customer');
        let address_schema = global.routes.include('model', 'endpoints/components/address');
        let creditcard_schema = global.routes.include('model', 'endpoints/components/creditcard');
        let affiliates_schema = global.routes.include('model', 'endpoints/components/affiliates');

        let v = new Validator();

        v.addSchema(address_schema, '/address');
        v.addSchema(creditcard_schema, '/creditcard');
        v.addSchema(affiliates_schema, '/affiliates');
        v.addSchema(customer_schema, '/customer');

        return v.validate(event, lead_schema);

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

                this.affiliate_fields.forEach((affiliate_field) => {

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

    handleLeadTracking(session, event){

        du.debug('Handle Lead Tracking');

        return this.handleTracking({session: session}, event).then(() => {

            return session;

        });

    }

    pushToRedshift(session){

        du.debug('Push To Redshift');

        return this.pushEventToRedshift('lead', session).then(() => {

            return session;

        });

    }

}

module.exports = new createLeadController();
