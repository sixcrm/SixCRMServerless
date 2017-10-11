'use strict';
const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class ProductController extends entityController {

    constructor(){

      super('product');

    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('productScheduleController', 'listProductSchedulesByProduct', {product: id}),
        this.executeAssociatedEntityFunction('transactionController', 'listByProductID', {id:id})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let product_schedules = data_acquisition_promises[0];
        let transactions = data_acquisition_promises[1];

        if(_.has(product_schedules, 'productschedules') && arrayutilities.nonEmpty(product_schedules.productschedules)){
          arrayutilities.map(product_schedules.productschedules, (product_schedule) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Product Schedule', object: product_schedule}));
          });
        }

        if(_.has(transactions, 'transactions') && arrayutilities.nonEmpty(transactions.transactions)){
          arrayutilities.map(transactions.transactions, (transaction) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Transaction', object:transaction}));
          });
        }

        return return_array;

      });

    }

    listByFulfillmentProvider({fulfillment_provider, pagination}){

      du.debug('List By Fulfillment Provider');

      let query_parameters = {
        filter_expression: '#f1 = :fulfillmentprovider_id',
        expression_attribute_values: {
          ':fulfillmentprovider_id':this.getID(fulfillment_provider)
        },
        expression_attribute_names: {
          '#f1':'fulfillment_provider'
        }
      };

      return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

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

      return this.listBy({list_array: products_array});

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
