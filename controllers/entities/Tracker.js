'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

//Technical Debt:  This should be a function of the Tracker Helper
const postbackutilities = global.SixCRM.routes.include('lib', 'postback-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class trackerController extends entityController {

    constructor(){

      super('tracker');

      this.search_fields = ['name'];

    }

    listByCampaignAndAffiliate({campaign, affiliate, type, pagination}){

      du.debug('List By Campaign And Affiliate');

      let query_parameters = {
        filter_expression: 'contains(#f1, :campaign_id) AND contains(#f2, :affiliate_id)',
        expression_attribute_values: {
          ':affiliate_id':this.getID(affiliate),
          ':campaign_id':this.getID(campaign)
        },
        expression_attribute_names: {
          '#f1':'campaigns',
          '#f2':'affiliates'
        }
      };

      if(!_.isUndefined(type)){
        query_parameters.filter_expression += ' AND #f3 = :type';
        query_parameters.expression_attribute_values[':type'] = type;
        query_parameters.expression_attribute_names['#f3'] = 'type';
      }

      //Technical Debt:  Update to use account query
      return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

    }

    listByCampaign({campaign, pagination}){

      du.debug('List By Campaign');

      return this.listByAssociations({id: this.getID(campaign), field: 'campaigns', pagination: pagination});

    }

    listByAffiliate({affiliate, pagination}){

      du.debug('List By Affiliate');

      return this.listByAssociations({id: this.getID(affiliate), field:'affiliates', pagination: pagination});

    }

    getAffiliates(tracker){

        du.debug('Get Affiliates');

        if(_.has(tracker, 'affiliates')){

          return this.executeAssociatedEntityFunction('affiliateController', 'listBy', {list_array: tracker.affiliates})
          .then(affiliates => this.getResult(affiliates, 'affiliates'));

        }

        return null;

    }

    getCampaigns(tracker){

        du.debug('Get Campaigns');

        if(_.has(tracker, 'campaigns')){

          return this.executeAssociatedEntityFunction('campaignController', 'listBy', {list_array: tracker.campaigns})
          .then((campaigns) => this.getResult(campaigns, 'campaigns'));

        }

        return null;

    }

    executePostback(tracker, data){

      du.debug('Execute Postback');

    //Note:  We may want to parse the affiliate that is executing the postback into the data object

      return postbackutilities.executePostback(tracker.body, data);

    }

}

module.exports = new trackerController();
