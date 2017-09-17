'use strict';
var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class fulfillmentProviderController extends entityController {

    constructor(){
      super('fulfillmentprovider');
    }

    //Technical Debt: finish!
    associatedEntitiesCheck({id}){
      return Promise.resolve([]);
    }

}

module.exports = new fulfillmentProviderController();
