'use strict';
const _ = require('underscore');

var du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
var eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
var arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class productScheduleController extends entityController {

    constructor(){

      super('productschedule');

    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('campaignController', 'listByAssociations', {id: id, field: 'productschedules'}),
        this.executeAssociatedEntityFunction('rebillController', 'listByAssociations', {id: id, field: 'product_schedules'})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let campaigns = data_acquisition_promises[0];
        let rebills = data_acquisition_promises[1];

        if(_.has(campaigns, 'campaigns') && arrayutilities.nonEmpty(campaigns.campaigns)){
          arrayutilities.map(campaigns.campaigns, (campaign) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Campaign', object: campaign}));
          });
        }

        if(_.has(rebills, 'rebills') && arrayutilities.nonEmpty(rebills.rebills)){
          arrayutilities.map(rebills.rebills, (rebill) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Rebill', object: rebill}));
          });
        }

        //du.warning(return_array); process.exit();

        return return_array;

      });

    }

    getCampaigns(args){

      du.debug('Get Campaigns');

      //Technical Debt:  This looks redundant.
      let product_schedule_id = this.getID(args.productschedule);

      return this.executeAssociatedEntityFunction('campaignController', 'listCampaignsByProductSchedule', {product_schedule: product_schedule_id, pagination: args.pagination});

    }

    //Technical Debt: This only works insofar as Scan Parameters returns all results (not true)
    //Technical Debt:  Expensive!
    //Technical Debt:  Slow
    //Technical Debt:  Dynamo scan't query on map attributes of lists
    //Technical Debt:  The input argumentation here is gross.
    listProductSchedulesByProduct(args){

        du.debug('List Product Schedules By Product');

        let product_id = this.getID(args.product);

        let scan_parameters = {};

        return this.scanByParameters({parameters: scan_parameters, pagination: args.pagination}).then((results) => {

          let return_array = [];

          if(_.has(results, 'productschedules') && _.isArray(results.productschedules) && results.productschedules.length > 0){

            results.productschedules.forEach((result) => {

              if(_.has(result, 'schedule') && _.isArray(result.schedule) && result.schedule.length > 0){

                let found = result.schedule.find((schedule) => {
                  return (_.has(schedule, 'product_id') && schedule.product_id == product_id);
                });

                if(_.isObject(found)){
                  return_array.push(result);
                }

              }

            });

            results.productschedules = return_array;
            results.pagination.count = return_array.length;
            results.has_next_page = false;

            return results;

          }else{

            return results;

          }

        });

    }

    getLoadBalancer(product_schedule){

      du.debug('Get Load Balancer');

      if(!_.has(product_schedule, 'loadbalancer')){ return Promise.resolve(null); }

      return this.executeAssociatedEntityFunction('loadBalancerController', 'get', {id: product_schedule.loadbalancer});

    }

    //Technical Debt:  THis is poorly named
    getTransactionProducts(day_in_schedule, schedules_to_purchase){

      du.debug('Get Transaction Products');

      let transaction_products = [];

      schedules_to_purchase.forEach((schedule) => {

        let product_for_purchase = this.getProductForPurchase(day_in_schedule, schedule.schedule);

        transaction_products.push({
          amount: parseFloat(product_for_purchase.price),
          product: product_for_purchase.product_id
        });

      });

      return transaction_products;

    }

    getProduct(scheduled_product){

      du.debug('Get Product');

      return this.executeAssociatedEntityFunction('productController', 'get', {id: scheduled_product.product});

    }

    getSchedule(product_schedule){

      du.debug('Get Schedule');

      if(arrayutilities.nonEmpty(product_schedule.schedule)){

        return arrayutilities.map(product_schedule.schedule, (scheduled_product) => {
          return this.getScheduledProduct(scheduled_product);
        });

      }else{

        return null;

      }

    }

    getScheduledProduct(scheduled_product){

      du.debug('Get Scheduled Product');

      return {
          price: scheduled_product.price,
          start: scheduled_product.start,
          end: scheduled_product.end,
          period: scheduled_product.period,
          product: scheduled_product.product_id
      };

    }

    getProducts(product_schedule){

      du.debug('Get Products');

      if(arrayutilities.nonEmpty(product_schedule.schedule)){

        let promises = arrayutilities.map(product_schedule.schedule, (product_schedule) => {
          return this.executeAssociatedEntityFunction('productController', 'get', {id: product_schedule.product_id});
        });

        return Promise.all(promises);

      }else{

        return null;

      }

    }

    //Technical Debt:  Can we make this work better?
    getProductScheduleHydrated(id){

      du.debug('Get Product Schedule Hydrated');

      return new Promise((resolve, reject) => {

        return this.get({id: id}).then((product_schedule) => {

          return this.getProducts(product_schedule).then((products) => {

            for(var i = 0; i < product_schedule.schedule.length; i++){

              for(var j = 0; j < products.length; j++){

                if(product_schedule.schedule[i].product_id == products[j].id){

                  product_schedule.schedule[i].product = products[j];

                  delete product_schedule.schedule[i].product_id;

                }

              }

            }

            return resolve(product_schedule);

          }).catch((error) => {

            return reject(error);

          });

        }).catch((error) => {

          return reject(error);

        });

      });

    }

    getProductSchedules(product_schedules){

      du.debug('Get Product Schedules');

      product_schedules = product_schedules || [];

    	return Promise.all(product_schedules.map(product_schedule => this.get({id: product_schedule})));

    }

    getProductForPurchase(day, schedule){

      du.debug('Get Product For Purchase');

      let return_product;

    	schedule.forEach((scheduled_product) => {

    		if(parseInt(day) >= parseInt(scheduled_product.start)){

    			if(!_.has(scheduled_product, "end")){

    				return_product = scheduled_product;

    				return true;

    			}

    			if(parseInt(day) < parseInt(scheduled_product.end)){

    				return_product = scheduled_product;

    				return true;

    			}

    		}

    	});

    	return return_product;

    }

    productSum(day_in_schedule, schedules_for_purchase){

      du.debug('Product Sum');

      let return_amount = 0.0;

      schedules_for_purchase.forEach((schedule) => {

        let product_for_purchase = this.getProductForPurchase(day_in_schedule, schedule.schedule);

        return_amount += parseFloat(product_for_purchase.price);

      });

      return parseFloat(return_amount);

    }

    listByLoadBalancer({loadbalancer, pagination}){

      du.debug('List By Load Balancer');

      let query_parameters = {
        filter_expression: '#f1 = :loadbalancer_id',
        expression_attribute_values: {
          ':loadbalancer_id':this.getID(loadbalancer)
        },
        expression_attribute_names: {
          '#f1':'loadbalancer'
        }
      };

      return this.list({query_parameters: query_parameters, pagination: pagination});

    }

}

module.exports = new productScheduleController();
