'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const postbackutilities = global.routes.include('lib', 'postback-utilities.js');

var entityController = global.routes.include('controllers', 'entities/Entity.js');
const affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');

class trackerController extends entityController {

    constructor(){
        super('tracker');
    }

    getAffiliate(tracker){

        return affiliateController.get(tracker.affiliate);

    }

    getByAffiliateID(affiliate){

        let affiliate_id = this.getID(affiliate);

        return this.listBySecondaryIndex('affiliate', affiliate_id, 'affiliate-index').then((results) => {

            return results.trackers;

        });

    }

    executePostback(tracker, data){

      //Note:  We may want to parse the affiliate that is executing the postback into the data object

        return postbackutilities.executePostback(tracker.body, data);

    }

}

module.exports = new trackerController();
