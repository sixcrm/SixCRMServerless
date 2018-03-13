'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class fulfillmentProviderController extends entityController {

    constructor(){
      super('fulfillmentprovider');

      this.encrypted_attribute_paths = [
          'provider.username',
          'provider.password',
          'provider.api_key',
          'provider.api_secret'
      ];
    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('productController', 'listByFulfillmentProvider', {fulfillment_provider:id})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let products = data_acquisition_promises[0];

        if(_.has(products, 'products') && arrayutilities.nonEmpty(products.products)){
          arrayutilities.map(products.products, (product) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Product', object: product}));
          });
        }

        return return_array;

      });

    }

}

module.exports = new fulfillmentProviderController();
