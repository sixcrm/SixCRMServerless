'use strict';
const _ = require("underscore");

const jwtutilities  = global.SixCRM.routes.include('lib', 'jwt-utilities');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

class AcquireTokenController extends transactionEndpointController {

    constructor(){

      super();

      this.required_permissions = [
        'user/read',
        'account/read',
        'campaign/read',
        'affiliate/read',
        'affiliate/create',
        'tracker/read'
      ];

      this.parameter_definitions = {
        execute: {
          required : {
            event:'event'
          }
        }
      };

      this.parameter_validation = {
        'updatedevent':global.SixCRM.routes.path('model', 'endpoints/acquireToken/updatedevent.json'),
        'event':global.SixCRM.routes.path('model', 'endpoints/acquireToken/event.json'),
        'campaign':global.SixCRM.routes.path('model', 'entities/campaign.json'),
        'transactionjwt':global.SixCRM.routes.path('model', 'definitions/jwt.json'),
        'redshifteventobject':global.SixCRM.routes.path('model', 'kinesisfirehose/events.json')
      };

      this.initialize();

    }

    execute(event){

      du.debug('Execute');

      return this.preamble(event)
      .then(() => this.validateCampaign())
      .then(() => this.acquireToken())
      .then((token) => {

        this.postProcessing();

        return this.parameters.get('transactionjwt');

      });

    }

    validateCampaign(){

      du.debug('Validate Campaign');

      let event = this.parameters.get('event');

      if(!_.has(this, 'campaignController')){
        this.campaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
      }

      return this.campaignController.get({id: event.campaign}).then((campaign) => {

        if(!_.has(campaign, 'id')){
          eu.throwError('bad_request','Invalid Campaign ID: '+event.campaign);
        }

        this.parameters.set('campaign', campaign);

        return true;

      });

    }

    acquireToken(){

      du.debug('Acquire Token');

      let jwt_prototype = {
        user:{
          user_alias: global.user.alias
        }
      };

      let transaction_jwt = jwtutilities.getJWT(jwt_prototype, 'transaction');

      this.parameters.set('transactionjwt', transaction_jwt);

      return Promise.resolve(true);

    }

    postProcessing(){

      du.debug('Post Processing');

      return this.updateEventObjectWithAffiliateInformation()
      .then(() => this.createEventPrototype())
      .then(() => this.pushToRedshift());

    }

    createEventPrototype(){

      du.debug('Create Event Prototype');

      let updated_event = this.parameters.get('updatedevent');

      let event_prototype = this.createEventObject(updated_event, 'click');

      this.parameters.set('redshifteventobject', event_prototype);

      return Promise.resolve(true);

    }

    updateEventObjectWithAffiliateInformation(){

      du.debug('Update Event Object With Affiliate Information');

      let event = this.parameters.get('event');

      if(!_.has(this, 'affiliateHelperController')){
        const AffiliateHelperController = global.SixCRM.routes.include('helpers', 'entities/affiliate/Affiliate.js');

        this.affiliateHelperController = new AffiliateHelperController();
      }

      return this.affiliateHelperController.handleAffiliateInformation(event)
      .then(updated_event => {

        this.parameters.set('updatedevent', updated_event);

        return true;

      });

    }

    pushToRedshift(){

      du.debug('Push To Redshift');

      let redshifteventobject = this.parameters.get('redshifteventobject');

      return this.pushRecordToRedshift('events', redshifteventobject).then(() => {

        return true;

      });

    }

}

module.exports = new AcquireTokenController();
