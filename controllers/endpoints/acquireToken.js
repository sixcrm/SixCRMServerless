'use strict';
const _ = require("underscore");

const jwtutilities  = global.SixCRM.routes.include('lib', 'jwt-utilities');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const AffiliateHelperController = global.SixCRM.routes.include('helpers', 'entities/affiliate/Affiliate.js');
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
        'redshifteventobject':global.SixCRM.routes.path('model', 'kinesisfirehose/events.json'),
        'affiliates':global.SixCRM.routes.path('model','endpoints/components/affiliates.json')
      };

      this.event_type = 'click';

      this.initialize();

    }

    execute(event){

      du.debug('Execute');

      return this.preamble(event)
      .then(() => this.validateCampaign())
      .then(() => this.acquireToken())
      .then(() => {
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

      this.handleAffiliateInformation().then(() => this.pushEvent());

      return true;

    }

    handleAffiliateInformation(){

      du.debug('Handle Affiliate Information');

      let event = this.parameters.get('event');

      if(!_.has(this, 'affiliateHelperController')){
        this.affiliateHelperController = new AffiliateHelperController();
      }

      return this.affiliateHelperController.handleAffiliateInformation(event).then(results => {

        if(_.has(results, 'affiliates')){

          this.parameters.set('affiliates', results.affiliates);

          return true;

        }

        return false;

      });

    }

}

module.exports = new AcquireTokenController();
