'use strict';
var entityController = global.routes.include('controllers', 'entities/Entity.js');

class fulfillmentProviderController extends entityController {

    constructor(){
        super(process.env.fulfillment_providers_table, 'fulfillmentprovider');
        this.table_name = process.env.fulfillment_providers_table;
        this.descriptive_name = 'fulfillmentprovider';
    }

}

module.exports = new fulfillmentProviderController();
