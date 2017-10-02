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
        //Technical Debt:  Affiliate allow is not being tested.
        this.executeAssociatedEntityFunction('campaignController', 'listByAffiliateAllow', {affiliate:id}),
        this.executeAssociatedEntityFunction('campaignController', 'listByAffiliateDeny', {affiliate:id}),
        this.executeAssociatedEntityFunction('sessionController', 'listSessionsByAffiliate', {affiliate:id}),
        this.executeAssociatedEntityFunction('trackerController', 'listByAffiliateID', {affiliate:id})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let campaign_allow = data_acquisition_promises[0];
        let campaign_deny = data_acquisition_promises[1];
        let sessions = data_acquisition_promises[2];
        let trackers = data_acquisition_promises[3];

        if(_.has(campaign_allow, 'campaigns') && arrayutilities.nonEmpty(campaign_allow.campaigns)){
          arrayutilities.map(campaign_allow.campaigns, (campaign) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Campaign', object: campaign}));
          });
        }

        if(_.has(campaign_deny, 'campaigns') && arrayutilities.nonEmpty(campaign_deny.campaigns)){
          arrayutilities.map(campaign_deny.campaigns, (campaign) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Campaign', object: campaign}));
          });
        }

        if(_.has(sessions, 'sessions') && arrayutilities.nonEmpty(sessions.sessions)){
          arrayutilities.map(sessions.sessions, (session) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Session', object: session}));
          });
        }

        if(_.has(trackers, 'trackers') && arrayutilities.nonEmpty(trackers.trackers)){
          arrayutilities.map(trackers.trackers, (tracker) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Tracker', object: tracker}));
          });
        }

        //du.warning(return_array); process.exit();

        return return_array;



      });

    }

    assureAffiliate(value){

        du.debug('Assure Affiliate');

        return this.get({id: value}).then((result) => {

            if(!_.isNull(result)){
                return result;
            }

            return this.getBySecondaryIndex({field: 'affiliate_id', index_value: value, index_name: 'affiliate_id-index'}).then((result) => {

                if(!_.isNull(result)){
                    return result;
                }

                return this.create({entity:{affiliate_id: value}}).then((result) => {

                    if(!_.isNull(result)){
                        return result;
                    }

                    eu.throwError('server','Unable to assure affiliate.');

                });

            });

        });

    }

    //Technical Debt:  Incomplete
    getCampaigns(affiliate, pagination){

      du.debug('Get Campaigns');

      let affiliate_id = this.getID(affiliate);

      return this.executeAssociatedEntityFunction('sessionController', 'listSessionsByAffiliate', {affiliate: affiliate_id, pagination: pagination});

    }

    getTrackers(affiliate){

      du.debug('Get Trackers');

      let affiliate_id = this.getID(affiliate);

      return this.executeAssociatedEntityFunction('trackerController', 'listBySecondaryIndex', {field:'affiliate', index_value: affiliate_id, index_name: 'affiliate-index'});

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

      let in_parameters = this.dynamoutilities.createINQueryParameters('affiliate_id', affiliate_ids);

      return this.list({query_parameters: in_parameters}).then(affiliates => {

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

      });

    }

}

module.exports = new affiliateController();
