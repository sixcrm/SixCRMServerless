'use strict';

var entityController = global.routes.include('controllers', 'entities/Entity.js');

class affiliateController extends entityController {

    constructor(){
        super(process.env.affiliates_table, 'affiliate');
        this.table_name = process.env.affiliates_table;
        this.descriptive_name = 'affiliate';
    }

}

module.exports = new affiliateController();
