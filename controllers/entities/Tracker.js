'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const postbackutilities = global.SixCRM.routes.include('lib', 'postback-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class trackerController extends entityController {

    constructor(){

        super('tracker');

    }

    //Technical Debt:  Replace with EntityController.listByAssociations
    listByCampaignID({id, pagination}){

      du.debug('Get By Campaign ID');

      let scan_parameters = {
        filter_expression: 'contains(#f1, :campaign_id)',
        expression_attribute_names:{
            '#f1': 'campaigns'
        },
        expression_attribute_values: {
            ':campaign_id': id
        }
      };

      return this.scanByParameters({parameters: scan_parameters});

    }

    getAffiliates(tracker){

        du.debug('Get Affiliates');

        if(_.has(tracker, 'affiliates')){

          return this.executeAssociatedEntityFunction('affiliateController', 'getList', {list_array: tracker.affiliates});

        }

        return null;

    }

    getCampaigns(tracker){

        du.debug('Get Campaigns');

        if(_.has(tracker, 'campaigns')){

          return this.executeAssociatedEntityFunction('campaignController', 'getList', {list_array: tracker.campaigns});

        }

        return null;

    }

    //Technical Debt:  Replace with EntityController.listByAssociations
    listByAffiliateID({affiliate, pagination}){

      du.debug('List By Affiliate ID');

      du.info(affiliate);

      let affiliate_id = this.getID(affiliate);

      let scan_parameters = {
        filter_expression: 'contains(#f1, :affiliate_id)',
        expression_attribute_names:{
            '#f1': 'affiliates'
        },
        expression_attribute_values: {
            ':affiliate_id': affiliate_id
        }
      };

      return this.scanByParameters({parameters: scan_parameters});

    }

    executePostback(tracker, data){

      du.debug('Execute Postback');

    //Note:  We may want to parse the affiliate that is executing the postback into the data object

      return postbackutilities.executePostback(tracker.body, data);

    }

}

module.exports = new trackerController();
