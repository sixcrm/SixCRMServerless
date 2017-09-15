'use strict';
var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class fulfillmentProviderController extends entityController {

    constructor(){
      super('fulfillmentprovider');
    }

}

module.exports = new fulfillmentProviderController();
