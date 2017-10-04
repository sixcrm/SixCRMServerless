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

    listByCampaignID({id, pagination}){

      du.debug('Get By Campaign ID');

      return this.listByAssociations({id: this.getID(id), field: 'campaigns', pagination: pagination});

    }

    getAffiliates(tracker){

        du.debug('Get Affiliates');

        if(_.has(tracker, 'affiliates')){

          return this.executeAssociatedEntityFunction('affiliateController', 'getList', {list_array: tracker.affiliates})
          .then(affiliates => this.getResult(affiliates, 'affiliates'));

        }

        return null;

    }

    getCampaigns(tracker){

        du.debug('Get Campaigns');

        if(_.has(tracker, 'campaigns')){

          return this.executeAssociatedEntityFunction('campaignController', 'getList', {list_array: tracker.campaigns})
          .then((campaigns) => this.getResult(campaigns, 'campaigns'));

        }

        return null;

    }

    listByAffiliateID({affiliate, pagination}){

      du.debug('List By Affiliate ID');

      return this.listByAssociation({id: this.getID(affiliate), field:'affiliates', pagination: pagination});

    }

    executePostback(tracker, data){

      du.debug('Execute Postback');

    //Note:  We may want to parse the affiliate that is executing the postback into the data object

      return postbackutilities.executePostback(tracker.body, data);

    }

}

module.exports = new trackerController();
