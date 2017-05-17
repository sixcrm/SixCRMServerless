'use strict';
var fulfillmentProviderController = global.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider');

class HashtagController extends fulfillmentProviderController {

    constructor(){

        super();

    }

    triggerFulfillment(){

        return Promise.resolve(this.stati.success);

    }

}

module.exports = new HashtagController();
