'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const postbackutilities = global.routes.include('lib', 'postback-utilities.js');

var entityController = global.routes.include('controllers', 'entities/Entity.js');

class trackerController extends entityController {

    constructor(){

        super('tracker');

        this.affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');

    }

    getAffiliate(tracker){

        du.debug('Get Affiliate');

        if(_.has(tracker, 'affiliate')){

            return this.affiliateController.get(tracker.affiliate);

        }

        return null;

    }

    getAffiliates(tracker){

        du.debug('Get Affiliates');

        if(_.has(tracker, 'affiliates')){

            return this.affiliateController.getList(tracker.affiliates);

        }

        return null;

    }

    getByAffiliateID(affiliate){

        du.debug('Get By Affiliate ID');

        let affiliate_id = this.getID(affiliate);

        return this.scanByParameters({
            filter_expression: 'contains(#f1, :affiliate_id)',
            expression_attribute_names:{
                '#f1': 'affiliates'
            },
            expression_attribute_values: {
                ':affiliate_id': affiliate_id
            }
        });

        /*
        return this.listBySecondaryIndex('affiliate', affiliate_id, 'affiliate-index').then((results) => {

            return results.trackers;

        });
        */



    }

    executePostback(tracker, data){

        du.debug('Execute Postback');

      //Note:  We may want to parse the affiliate that is executing the postback into the data object

        return postbackutilities.executePostback(tracker.body, data);

    }

}

module.exports = new trackerController();
