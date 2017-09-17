'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const modelvalidationutilities = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

var customerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');
var campaignController = global.SixCRM.routes.include('controllers', 'entities/Campaign.js');
var sessionController = global.SixCRM.routes.include('controllers', 'entities/Session.js');
const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/transaction.js');

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
  			.then((session_object) => this.handleNotifications(session_object))
        .then((session_object) => this.sendEmails('lead', session_object));

    }

    validateEventSchema(event){

      du.debug('Validate Event Schema');

      return modelvalidationutilities.validateModel(event,  global.SixCRM.routes.path('model', 'endpoints/lead.json'));

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

                        return reject(eu.getError('not_implemented', 'Unable to create a new customer.'));

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

            var getCampaign = campaignController.get({id: event.campaign});
            var getCustomer = customerController.getCustomerByEmail(event.customer.email);

            promises.push(getCampaign);
            promises.push(getCustomer);

            return Promise.all(promises).then((promises) => {

                let campaign = promises[0];
                let customer = promises[1];

                if(!_.has(campaign, 'id')){ return reject(eu.getError('bad_request','A invalid campaign id is specified.')); }

                if(!_.has(customer, "id")){ return reject(eu.getError('bad_request','A invalid customer id is specified.')); }

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
