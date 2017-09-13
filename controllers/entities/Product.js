'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class ProductController extends entityController {

    constructor(){

      super('product');

    }

    getFulfillmentProvider(product){

      du.debug('Get Fulfillment Provider');

      if (!product.fulfillment_provider) {
          return Promise.resolve(null); //fulfillment_provider is optional
      }

      return this.executeAssociatedEntityFunction('fulfillmentProviderController', 'get', {id: product.fulfillment_provider});

    }

    getProducts(products_array){

      du.debug('Get Products');

      return this.getList({list_array: products_array});

    }

    getProductSchedules(args){

      du.debug('Get Product Schedules');

      if(!_.has(args, 'product')){
        eu.throwError('bad_request','getProductSchedules requires a product argument.');
      }

      return this.executeAssociatedEntityFunction('productScheduleController', 'listProductSchedulesByProduct', {product: args.product, pagination: args.pagination});

    }

}

module.exports = new ProductController();
