'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.routes.include('lib', 'array-utilities.js');

var entityController = global.routes.include('controllers', 'entities/Entity.js');

class campaignController extends entityController {

    constructor(){

        super('campaign');

        this.productController = global.routes.include('controllers', 'entities/Product.js');
        this.loadBalancerController = global.routes.include('controllers', 'entities/LoadBalancer.js');
        this.productScheduleController = global.routes.include('controllers', 'entities/ProductSchedule.js');
        this.affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');
        this.emailTemplateController = global.routes.include('controllers', 'entities/EmailTemplate.js');

    }

    listAffiliatesByCampaign(args){

      du.debug('List Affiliates By Campaign');

      let affiliate_id = this.getID(args.affiliate);

      let query_parameters = {
        filter_expression: '#f1 = :affiliate_id OR #f2 = :affiliate_id OR #f3 = :affiliate_id OR #f4 = :affiliate_id OR #f5 = :affiliate_id OR #f6 = :affiliate_id',
        expression_attribute_values: {
          ':affiliate_id':affiliate_id
        },
        expression_attribute_names: {
          '#f1':'affiliate',
          '#f2':'subaffiliate_1',
          '#f3':'subaffiliate_2',
          '#f4':'subaffiliate_3',
          '#f5':'subaffiliate_4',
          '#f6':'subaffiliate_5',
        }
      };

      this.sessionController.queryByParameters(query_parameters, args.pagination);

    }

    listCampaignsByProduct(args){

      du.debug('Get Campaigns');

      if(!_.has(args, 'product')){
        eu.throwError('bad_request','listCampaignsByProduct requires a product argument.');
      }

      //Technical Debt: Due to the way that controllers extend other controllers...
      let psc = this.productScheduleController;

      if(!_.isFunction(psc.listProductSchedulesByProduct)){
        psc = global.routes.include('controllers', 'entities/ProductSchedule.js');
      }

      return psc.listProductSchedulesByProduct({product: args.product, pagination: args.pagination}).then((product_schedules) => {

        if(_.has(product_schedules, 'productschedules') && _.isArray(product_schedules.productschedules)){

          let campaigns = product_schedules.productschedules.map((product_schedule) => this.listCampaignsByProductSchedule({productschedule: product_schedule, pagination: args.pagination}));

          return Promise.all(campaigns).then((responses) => {

            let return_array = [];

            responses.forEach((response) => {

              if(_.has(response, 'campaigns') && _.isArray(response.campaigns) && response.campaigns.length > 0){

                response.campaigns.forEach((campaign) => {

                  return_array.push(campaign);

                });

              }

            });

            return_array = arrayutilities.filter(return_array, (possible_duplicate, index) => {

              let duplicate = false;

              for(var i = 0; i < return_array.length; i++){
                if(possible_duplicate.id == return_array[i].id){
                  if(i > index){
                    duplicate = true;
                    return;
                  }
                }
              }

              return !duplicate;

            });

            return {
              campaigns: return_array,
              pagination: {
                count: return_array.length,
                end_cursor: '',
                has_next_page: false,
                last_evaluated: ''
              }
            };

          });

        }

      });

    }

    listCampaignsByProductSchedule(args){

      du.debug('List Campaigns By Product Schedule');

      let product_schedule_id = this.getID(args.productschedule);

      let scan_parameters = {
        filter_expression: 'contains(#f1, :product_schedule_id)',
        expression_attribute_names:{
            '#f1': 'productschedules'
        },
        expression_attribute_values: {
            ':product_schedule_id': product_schedule_id
        }
      };

      return this.scanByParameters(scan_parameters, args.pagination);

    }

    getEmailTemplatesByEventType(campaign, event_type){

        du.debug('Get Email Templates By Event Type');

      //Technical Debt:  Update this query to be a compound condition
        return this.getEmailTemplates(campaign).then((email_templates) => {

            let typed_email_templates = [];

            email_templates.forEach((email_template) => {

                if(_.has(email_template, 'type') && email_template.type == event_type){

                    typed_email_templates.push(email_template);

                }

            });

            return typed_email_templates;

        });

    }

    getEmailTemplates(campaign){

        du.debug('Get Email Templates');

        if(_.has(campaign, "emailtemplates")){

            let acquisitions = campaign.emailtemplates.map(id => this.emailTemplateController.get(id));

            return Promise.all(acquisitions).then((acquisitions) => {

                return acquisitions;

            });

        }else{

            return Promise.resolve(null);

        }

    }

    getProducts(campaign){

        if(_.has(campaign, "products")){

            return campaign.products.map(id => this.productController.get(id));

        }else{

            return null;

        }

    }

    getProductSchedules(campaign){

        if(_.has(campaign, "productschedules")){

          //Technical Debt: Due to the way that controllers extend other controllers...
          let psc = this.productScheduleController;

          if(!_.isFunction(psc.get)){
            psc = global.routes.include('controllers', 'entities/ProductSchedule.js');
          }

          return campaign.productschedules.map(id => psc.get(id));

        }else{

            return null;

        }

    }

    getProductSchedulesHydrated(campaign){

      du.highlight('Get Product Schedule Hydrated');

      if(!_.has(campaign, "productschedules")){ return null; }

      let psc = this.productScheduleController;

      if(!_.isFunction(psc.getProductScheduleHydrated)){
        psc = global.routes.include('controllers', 'entities/ProductSchedule.js');
      }

      return Promise.all(campaign.productschedules.map(id => psc.getProductScheduleHydrated(id)));

    }

    getAffiliate(campaign){

        return this.affiliateController.get(campaign.affiliate);

    }

    hydrate(campaign){

      return this.getProductSchedulesHydrated(campaign).then((product_schedules) => {

          campaign.productschedules = product_schedules;

          return campaign;

      });

    }

    getHydratedCampaign(id) {

      return this.get(id).then((campaign) => this.hydrate(campaign));

    }

    validateProductSchedules(product_schedules, campaign){

        if(!_.has(campaign, 'productschedules') || !_.isArray(campaign.productschedules) || campaign.productschedules.length < 1){

            eu.throwError('server','Invalid product schedule.');

        }

        var campaign_product_schedules = campaign.productschedules;

        for(var i = 0; i < product_schedules.length; i++){

            var schedule_found = false;

            for(var j = 0; j < campaign_product_schedules.length; j++){

                let campaign_product_schedule = campaign_product_schedules[j];

                if(!this.isUUID(campaign_product_schedule) && _.has(campaign_product_schedules[j], 'id')){

                    campaign_product_schedule = campaign_product_schedules[j].id;

                }

                if(product_schedules[i].id == campaign_product_schedule){

                    schedule_found = true;

                }

            }

            if(schedule_found == false){

                eu.throwError('server','Product schedule does not agree with campaign product schedule: '+product_schedules[i].id);

            }

        }

        return true;

    }

}

module.exports = new campaignController();
