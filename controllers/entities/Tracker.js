'use strict';
const _ = require('underscore');

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

}

module.exports = new trackerController();
