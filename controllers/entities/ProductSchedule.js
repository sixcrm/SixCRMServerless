'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const ProductScheduleHelper = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class productScheduleController extends entityController {

    constructor(){

      super('productschedule');

      this.productScheduleHelper = new ProductScheduleHelper();

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

      return this.executeAssociatedEntityFunction('campaignController', 'listCampaignsByProductSchedule', {productschedule: product_schedule_id, pagination: args.pagination});

    }

    //Technical Debt: This only works insofar as Scan Parameters returns all results (not true)
    //Technical Debt:  Expensive!
    //Technical Debt:  Slow
    //Technical Debt:  Dynamo scan't query on map attributes of lists
    listByProduct({product, pagination}){

      du.debug('List By Product');

      let product_id = this.getID(product);

      //Technical Debt:  This just attempts to get all products...  BUT DOESN'T
      return this.scanByParameters({parameters: {}, pagination: pagination})
      .then((productschedules) => this.getResult(productschedules, 'productschedules'))
      .then((productschedules) => {

        let return_array = [];

        if(arrayutilities.nonEmpty(productschedules)){

          arrayutilities.map(productschedules, productschedule => {

            if(arrayutilities.nonEmpty(productschedule.schedule)){

              let found = arrayutilities.find(productschedule.schedule, (schedule) => {
                return (_.has(schedule, 'product_id') && schedule.product_id == product_id);
              });

              if(!_.isUndefined(found)){
                return_array.push(productschedule);
              }
            }

          });

        }

        return {
          productschedules: return_array,
          pagination: this.buildPaginationObject({
            Count: return_array.length
          })
        }

      });

    }

    getLoadBalancer(product_schedule){

      du.debug('Get Load Balancer');

      if(!_.has(product_schedule, 'loadbalancer')){ return Promise.resolve(null); }

      return this.executeAssociatedEntityFunction('loadBalancerController', 'get', {id: product_schedule.loadbalancer});

    }

    getProduct(scheduled_product){

      du.debug('Get Product');

      return this.executeAssociatedEntityFunction('productController', 'get', {id: scheduled_product.product});

    }

    getProducts(product_schedule){

      du.debug('Get Products');

      if(_.has(product_schedule, 'schedule') && arrayutilities.nonEmpty(product_schedule.schedule)){

        let product_ids = arrayutilities.map(product_schedule.schedule, (product_schedule) => {
          return product_schedule.product_id;
        });

        if(arrayutilities.nonEmpty(product_ids)){

          let query_parameters = this.createINQueryParameters({field: 'id', list_array: product_ids});

          return this.executeAssociatedEntityFunction('productController', 'listByAccount', {query_parameters: query_parameters});

        }

      }

      return Promise.null;

    }

    //Technical Debt:  Can we make this work better?
    getProductScheduleHydrated(id){

      du.debug('Get Product Schedule Hydrated');

      return this.get({id: id}).then((product_schedule) => {

        if(_.has(product_schedule, 'schedule')){

          return this.getProducts(product_schedule).then((products) => {

            return this.productScheduleHelper.marryProductsToSchedule({product_schedule: product_schedule, products: products});

          });

        }else{

          return product_schedule;

        }

      });

    }

    listProductSchedulesByList({product_schedules}){

      du.debug('List Product Schedules By List');

      let query_parameters = this.createINQueryParameters({field: 'id', list_array: product_schedules});

      return this.listByAccount({query_parameters: query_parameters});

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

      return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

    }

}

module.exports = new productScheduleController();
