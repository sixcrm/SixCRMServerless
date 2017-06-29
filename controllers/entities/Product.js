'use strict';
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities');

var entityController = global.routes.include('controllers', 'entities/Entity.js');

class ProductController extends entityController {

    constructor(){
        super('product');
        this.productScheduleController = global.routes.include('controllers', 'entities/ProductSchedule.js');
        this.fulfillmentProviderController = global.routes.include('controllers', 'entities/FulfillmentProvider.js');
    }

    getFulfillmentProvider(product){

      du.debug('Get Fulfillment Provider');

      return this.fulfillmentProviderController.get(product.fulfillment_provider);

    }

    getProducts(products_array){

      du.debug('Get Products');

      return this.getList(products_array);

    }

    getProductSchedules(product){

      du.debug('Get Product Schedules');

      return this.productScheduleController.getProductSchedulesByProduct(product);

    }

}

module.exports = new ProductController();
