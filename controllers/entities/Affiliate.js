'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

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

    assureAffiliates(affiliate_ids){

      du.debug('Assure Affiliates');

      arrayutilities.nonEmpty(affiliate_ids, true);

      let all_strings = arrayutilities.every(affiliate_ids, (affiliate_id) => {
        return _.isString(affiliate_id);
      });

      if(all_strings == false){
        eu.throwError('server', 'affiliateController.assureAffiliates assumes all affiliate ID\'s are strings.');
      }

      affiliate_ids = arrayutilities.unique(affiliate_ids);

      return this.listBy({list_array: affiliate_ids})
      .then(affiliates => this.getResult)
      .then(affiliates => {

        if(arrayutilities.nonEmpty(affiliates)){

          let return_array = [];

          arrayutilities.map(affiliate_ids, (affiliate_id) => {

            let affiliate_record = arrayutilities.find(affiliates.affiliates, affiliate => {
              return (affiliate.affiliate_id == affiliate_id);
            });

            if(_.isUndefined(affiliate_record)){

              let new_affiliate = {affiliate_id: affiliate_id};

              return_array.push(Promise.resolve(this.create({entity:new_affiliate})));

            }else{

              return_array.push(Promise.resolve(affiliate_record));

            }

          });

          return Promise.all(return_array);

        }

        eu.throwError('server', 'Something strange happened assuring affiliates.');

      }).then(assured_affiliates => {

        //Sanity Check
        arrayutilities.nonEmpty(assured_affiliates, true);
        arrayutilities.nonEmpty(affiliate_ids, true);

        if(assured_affiliates.length != affiliate_ids.length){
          eu.throwError('server', 'Assured affiliates result has different length than input ID array.');
        }

        return assured_affiliates;

      });

    }

}

module.exports = new affiliateController();
