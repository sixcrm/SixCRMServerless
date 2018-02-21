'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

class CreateLeadController extends transactionEndpointController{

    constructor(){
      super();

      this.required_permissions = [
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
      ];

      this.notification_parameters = {
        type: 'lead',
        action: 'created',
        title:  'New Lead',
        body: 'A new lead has been created.'
      };

      this.parameter_definitions = {
        execute: {
          required : {
            event:'event'
          }
        }
      };

      this.parameter_validation = {
        'event':global.SixCRM.routes.path('model', 'endpoints/createLead/event.json'),
        'customer': global.SixCRM.routes.path('model', 'entities/customer.json'),
        'affiliates':global.SixCRM.routes.path('model', 'endpoints/components/affiliates.json'),
        'campaign':global.SixCRM.routes.path('model', 'entities/campaign.json'),
        'session_prototype':global.SixCRM.routes.path('model', 'endpoints/createLead/sessionprototype.json'),
        'session':global.SixCRM.routes.path('model', 'entities/session.json'),
      };

      this.campaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
      this.customerController = global.SixCRM.routes.include('entities', 'Customer.js');
      this.sessionController = global.SixCRM.routes.include('entities', 'Session.js');

      this.event_type = 'lead';

      this.initialize();

    }

    execute(event){

      du.debug('Execute');

      return this.preamble(event)
      .then(() => this.createLead());

    }

    createLead(){

      du.debug('Create Lead');

      return this.assureLeadProperties()
      .then(() => this.createSessionPrototype())
			.then(() => this.assureSession())
      .then(() => {

        this.postProcessing();

        return this.parameters.get('session');

      });

    }

    assureLeadProperties(){

      du.debug('Assure Lead Properties');

      let promises = [
        this.assureCustomer(),
        this.assureAffiliates(),
        this.setCampaign()
      ];

      return Promise.all(promises).then(() => {
        return true;
      });

    }

    setCampaign(){

      du.debug('Set Campaign');

      let event = this.parameters.get('event');

      return this.campaignController.get({id: event.campaign}).then(campaign => {

        this.parameters.set('campaign', campaign);

        return true;

      });

    }

    assureAffiliates(){

      du.debug('Assure Affiliates');

      let event = this.parameters.get('event');

      return this.affiliateHelperController.handleAffiliateInformation(event).then(result => {

        if(_.has(result, 'affiliates')){
          this.parameters.set('affiliates', result.affiliates);
        }

        return true;

      });

    }

    assureCustomer(){

      du.debug('Assure Customer');

      let event = this.parameters.get('event');

      return this.customerController.getCustomerByEmail(event.customer.email).then((customer) => {

        if(_.has(customer, 'id')){
          this.parameters.set('customer', customer);
          return true;
        }

        return this.customerController.create({entity: event.customer}).then(customer => {
          this.parameters.set('customer', customer);
          return true;
        });

      });

    }

    //Technical Debt:  Session Helper!
    createSessionPrototype(){

      du.debug('Create Session Prototype');

      let customer = this.parameters.get('customer');
      let campaign = this.parameters.get('campaign');
      let affiliates = this.parameters.get('affiliates', null, false);

      let session_prototype = {
        customer: customer.id,
        campaign: campaign.id,
        completed: false
      };

      if(!_.isNull(affiliates)){
        session_prototype = objectutilities.merge(session_prototype, affiliates);
      }

      this.parameters.set('session_prototype', session_prototype);

      return Promise.resolve(true);

    }

    assureSession(){

      du.debug('Assure Session');

      let session_prototype = this.parameters.get('session_prototype');

      //Technical Debt: test this 100%
      return this.sessionController.assureSession(session_prototype).then(session => {
        this.parameters.set('session', session);
        return true;
      });

    }

    postProcessing(){

      du.debug('Post Processing');

      this.pushEvent()

      return true;

    }

}

module.exports = new CreateLeadController();
