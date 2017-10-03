'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

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
                'usersetting/read',
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
                'notificationsetting/read',
                'tracker/read',
                'emailtemplate/read',
                'smtpprovider/read'
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
      .then((session_object) => {

        this.handleLeadTracking(session_object, event);
        this.pushToRedshift(session_object);
        //this.handleNotifications(session_object);
        this.sendEmails('lead', session_object);

        return session_object;

      });

    }

    validateEventSchema(event){

      du.debug('Validate Event Schema');

      return modelvalidationutilities.validateModel(event,  global.SixCRM.routes.path('model', 'endpoints/lead.json'));

    }

    assureCustomer(event){

      return customerController.getCustomerByEmail(event.customer.email).then((customer) => {

        if(_.has(customer, 'id')){
          return customer;
        }

        return customerController.create({entity: event.customer});

      }).then((customer) => {

        this.session_customer = customer;

        return event;

      });

    }

    createSessionObject(event){

      du.debug('Create Session Object');

      var promises = [];

      return campaignController.get({id: event.campaign}).then(campaign => {

        let protosession = {
          customer: this.session_customer,
          campaign: campaign,
        };

        if(_.has(event, 'affiliates')){

          arrayutilities.map(this.affiliate_fields, (affiliate_field) => {

            if(_.has(event.affiliates, affiliate_field) && !_.isNull(event.affiliates[affiliate_field])){

              protosession[affiliate_field] = event.affiliates[affiliate_field];

            }

          });

        }

        return sessionController.createSessionObject(protosession);

      });

    }

    persistSession(session_object){

      du.debug('Persist Session');

      return sessionController.assureSession(session_object);

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
