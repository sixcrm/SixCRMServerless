'use strict';
const _ = require('underscore');
const du = global.routes.include('lib', 'debug-utilities');
const Validator = require('jsonschema').Validator;

var dynamoutilities = global.routes.include('lib', 'dynamodb-utilities.js');
var fulfillmentProviderController = global.routes.include('controllers', 'entities/FulfillmentProvider.js');
var entityController = global.routes.include('controllers', 'entities/Entity.js');

class ProductController extends entityController {

    constructor(){
        super('product');
    }

    getFulfillmentProvider(product){

        return fulfillmentProviderController.get(product.fulfillment_provider);

    }

    getProducts(products_array){

        du.debug('Get Products');

        return this.getList(products_array);

    }

}

module.exports = new ProductController();
