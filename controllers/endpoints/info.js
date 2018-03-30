'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
const ProductController = global.SixCRM.routes.include('controllers', 'entities/Product.js');
const ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

module.exports = class InfoController extends transactionEndpointController{

    constructor(){

      super();

      this.required_permissions = [
        'product/read',
        'productschedule/read'
      ];

      this.parameter_definitions = {
        execute: {
          required : {
            event:'event'
          }
        }
      };

      this.parameter_validation = {
        'event':global.SixCRM.routes.path('model', 'endpoints/info/event.json'),
        'products':global.SixCRM.routes.path('model', 'entities/components/products.json'),
        'product_schedules':global.SixCRM.routes.path('model', 'entities/components/productschedules.json')
      };

      this.productController = new ProductController();
      this.productScheduleController = new ProductScheduleController();

      this.initialize();

    }

    execute(event){

      du.debug('Execute');

      return this.preamble(event)
			.then(() => this.acquireInfoRequestProperties())
      //Note: filtering or validation here?
      .then(() => this.respond());

    }

    acquireInfoRequestProperties(){

      du.debug('Acquire Request Properties');

      let promises = [];

      promises.push(this.acquireProducts());
      promises.push(this.acquireProductSchedules());

      return Promise.all(promises).then(() => {
        return true;
      });

    }

    acquireProducts(){

      du.debug('Acquire Products');

      let event = this.parameters.get('event');

      if(!_.has(event, 'products') || !arrayutilities.nonEmpty(event.products)){ return null; }

      return this.productController.getListByAccount({ids: event.products}).then(result => {
        return this.parameters.set('products', result.products);
      });

    }

    acquireProductSchedules(){

      du.debug('Acquire Product Schedules');

      let event = this.parameters.get('event');

      if(!_.has(event, 'productschedules') || !arrayutilities.nonEmpty(event.productschedules)){ return null; }

      const ProductScheduleHelper = global.SixCRM.routes.include('helpers','entities/productschedule/ProductSchedule.js');
      let productScheduleHelper = new ProductScheduleHelper();

      return this.productScheduleController.getListByAccount({ids: event.productschedules}).then(product_schedules_result => {

        let hydrated_product_schedules_promises = arrayutilities.map(product_schedules_result.productschedules, product_schedule => {

          return this.productScheduleController.getProducts(product_schedule).then(products_result => {
            du.info(products_result);
            return productScheduleHelper.marryProductsToSchedule({product_schedule: product_schedule, products: products_result.products});
          });
        });

        return Promise.all(hydrated_product_schedules_promises).then(hydrated_product_schedules_promises => {

          return this.parameters.set('productschedules', hydrated_product_schedules_promises);

        })

      });

    }

    respond(){

      du.debug('Respond');

      let response_object = {};

      let event = this.parameters.get('event');

      if(_.has(event, 'products')){

        let products = this.parameters.get('products', false, null);

        response_object.products = products;

      }

      if(_.has(event, 'productschedules')){

        let product_schedules = this.parameters.get('productschedules', false, null);

        response_object.productschedules = product_schedules;

      }

      return response_object;

    }

}

