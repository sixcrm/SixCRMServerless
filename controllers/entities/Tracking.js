'use strict';
const _ = require('underscore');

var entityController = global.routes.include('controllers', 'entities/Entity.js');
const affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');

class trackingController extends entityController {

    constructor(){
        super(process.env.tracking_table, 'tracking');
        this.table_name = process.env.tracking_table;
        this.descriptive_name = 'tracking';
    }

    getAffiliate(tracking){

        return affiliateController.get(tracking.affiliate);

    }

}

module.exports = new trackingController();
