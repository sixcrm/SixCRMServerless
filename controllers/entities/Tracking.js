'use strict';
const _ = require('underscore');

var entityController = global.routes.include('controllers', 'entities/Entity.js');

class trackingController extends entityController {

    constructor(){
        super(process.env.tracking_table, 'tracking');
        this.table_name = process.env.tracking_table;
        this.descriptive_name = 'tracking';
    }

}

module.exports = new trackingController();
