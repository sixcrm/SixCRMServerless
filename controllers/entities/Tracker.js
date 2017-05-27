'use strict';
const _ = require('underscore');

const postbackutilities = global.routes.include('lib', 'postback-utilities.js');

var entityController = global.routes.include('controllers', 'entities/Entity.js');
const affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');

class trackerController extends entityController {

    constructor(){
        super(process.env.tracker_table, 'tracker');
        this.table_name = process.env.tracker_table;
        this.descriptive_name = 'tracker';
    }

    getAffiliate(tracker){

        return affiliateController.get(tracker.affiliate);

    }

    getByAffiliateID(affiliate){

        let affiliate_id = this.getID(affiliate);

        return trackerController.listBySecondaryIndex('affiliate', affiliate_id, 'affiliate-index');

    }

    executePostback(tracker, data){

      //Note:  We may want to parse the affiliate that is executing the postback into the data object

        return postbackutilities.executePostback(tracker.body, data);

    }

}

module.exports = new trackerController();
