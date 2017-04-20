'use strict';
var fulfillmentProviderController = require('./FulfillmentProvider');

class HashtagController extends fulfillmentProviderController {

    constructor(){

        super();

    }

    triggerFulfillment(){

        return Promise.resolve(this.stati.success);

    }

}

module.exports = new HashtagController();