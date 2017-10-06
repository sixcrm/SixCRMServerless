'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class affiliateController extends entityController {

    constructor(){

        super('affiliate');

    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('campaignController',  'listByAffiliateAllow', {affiliate:id}).then((campaigns) => this.getResult(campaigns, 'campaigns')),
        this.executeAssociatedEntityFunction('campaignController',  'listByAffiliateDeny', {affiliate:id}).then((campaigns) => this.getResult(campaigns, 'campaigns')),
        this.executeAssociatedEntityFunction('sessionController',   'listByAffiliate', {affiliate:id}).then((sessions) => this.getResult(sessions, 'sessions')),
        this.executeAssociatedEntityFunction('trackerController',   'listByAffiliate', {affiliate:id}).then((trackers) => this.getResult(trackers, 'trackers'))
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let campaign_allow = data_acquisition_promises[0];
        let campaign_deny = data_acquisition_promises[1];
        let sessions = data_acquisition_promises[2];
        let trackers = data_acquisition_promises[3];

        if(arrayutilities.nonEmpty(campaign_allow)){
          arrayutilities.map(campaign_allow, (campaign) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Campaign', object: campaign}));
          });
        }

        if(arrayutilities.nonEmpty(campaign_deny)){
          arrayutilities.map(campaign_deny, (campaign) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Campaign', object: campaign}));
          });
        }

        if(arrayutilities.nonEmpty(sessions)){
          arrayutilities.map(sessions, (session) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Session', object: session}));
          });
        }

        if(arrayutilities.nonEmpty(trackers)){
          arrayutilities.map(trackers, (tracker) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Tracker', object: tracker}));
          });
        }

        return return_array;

      });

    }

    getCampaigns({affiliate, pagination}){

      du.debug('Get Campaigns');

      return this.executeAssociatedEntityFunction('sessionController', 'listByAffiliate', {affiliate: affiliate, pagination: pagination});

    }

    getTrackers({affiliate, pagination}){

      du.debug('Get Trackers');

      return this.executeAssociatedEntityFunction('trackerController', 'listByAffiliate', {affiliate: affiliate, pagination: pagination});

    }

    validateAssureAffiliatesArray(affiliate_ids){

      du.debug('Validate Assure Affiliates Array');

      arrayutilities.nonEmpty(affiliate_ids, true);

      let all_strings = arrayutilities.every(affiliate_ids, (affiliate_id) => {
        return stringutilities.nonEmpty(affiliate_id);
      });

      if(all_strings == false){
        eu.throwError('server', 'affiliateController.assureAffiliates assumes all affiliate ID\'s are strings.');
      }

    }

    hasAffiliateMatch({affiliate_id, affiliates}){

      du.debug('Has Affiliate Match');

      if(arrayutilities.nonEmpty(affiliates)){

        let affiliate_record = arrayutilities.find(affiliates, affiliate => {
          return (_.has(affiliate, 'affiliate_id') && affiliate.affiliate_id == affiliate_id);
        });

        if(!_.isUndefined(affiliate_record)){
          return affiliate_record;
        }

      }

      return false;

    }

    assureAffiliatesArrayTransform({affiliate_ids, affiliates}){

      du.debug('Assure Affiliates Array Transform');

      let return_array = [];

      arrayutilities.map(affiliate_ids, (affiliate_id) => {

        let affiliate_match = this.hasAffiliateMatch({affiliate_id: affiliate_id, affiliates: affiliates});

        if(affiliate_match === false){

          return_array.push(this.create({entity:{affiliate_id: affiliate_id}}));

          return;

        }

        return_array.push(affiliate_match);

      });

      return Promise.all(return_array);

    }

    validateAssuredAffiliates({affiliate_ids, assured_affiliates}){

      du.debug('Validate Assured Affiliates');

      //Sanity Check
      arrayutilities.nonEmpty(assured_affiliates, true);
      arrayutilities.nonEmpty(affiliate_ids, true);

      if(assured_affiliates.length != affiliate_ids.length){
        eu.throwError('server', 'Assured affiliates result has different length than input ID array.');
      }

      return assured_affiliates;

    }


    assureAffiliates(affiliate_ids){

      du.debug('Assure Affiliates');

      this.validateAssureAffiliatesArray(affiliate_ids);

      affiliate_ids = arrayutilities.unique(affiliate_ids);

      return this.listBy({list_array: affiliate_ids, field: 'affiliate_id'})
      .then(affiliates => this.getResult(affiliates, 'affiliates'))
      .then(affiliates => this.assureAffiliatesArrayTransform({affiliate_ids: affiliate_ids, affiliates: affiliates}))
      .then(assured_affiliates => this.validateAssuredAffiliates({affiliate_ids: affiliate_ids, assured_affiliates: assured_affiliates}));

    }

}

module.exports = new affiliateController();
