'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class campaignController extends entityController {

    constructor(){

      super('campaign');

    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('sessionController', 'listByCampaignID', {id:id}),
        this.executeAssociatedEntityFunction('trackerController', 'listByCampaignID', {id:id})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let sessions = data_acquisition_promises[0];
        let trackers = data_acquisition_promises[1];

        //du.warning(sessions, trackers); process.exit();

        if(!_.isNull(sessions.sessions)){
          arrayutilities.map(sessions.sessions, (session) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Session', object: session}));
          });
        }

        if(!_.isNull(trackers.trackers)){
          arrayutilities.map(trackers.trackers, (tracker) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Tracker', object:tracker}));
          });
        }

        return return_array;

      });

    }

    getAffiliateAllowDenyList(list){

      du.debug('Get Affiliate Allow Deny List');

      if(!arrayutilities.nonEmpty(list)){
        return null;
      }

      let list_promises = arrayutilities.map(list, (list_item) => {

        if(list_item == '*'){
          return Promise.resolve({id:'*', name:'All'});
        }else if(this.isUUID(list_item)){
          return this.executeAssociatedEntityFunction('affiliateController', 'get', {id: list_item});
        }

      });

      return Promise.all(list_promises);

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

      let pagination = args.pagination;

      return this.executeAssociatedEntityFunction('sessionController', 'queryByParameters', {query_parameters: query_parameters, pagination: pagination});

    }

    //Technical Debt:  This seems VERY general in terms of parameterization
    listCampaignsByProduct(args){

      du.debug('Get Campaigns');

      //Technical Debt:  Clumsy.  Adjust parameterization
      if(!_.has(args, 'product')){
        eu.throwError('bad_request','listCampaignsByProduct requires a product argument.');
      }

      return this.executeAssociatedEntityFunction('productScheduleController', 'listProductSchedulesByProduct', {product: args.product, pagination: args.pagination}).then((product_schedules) => {

        if(_.has(product_schedules, 'productschedules') && _.isArray(product_schedules.productschedules)){

          let campaigns = arrayutilities.map(product_schedules.productschedules, (product_schedule) => {
            return this.listCampaignsByProductSchedule({productschedule: product_schedule, pagination: args.pagination})
          });

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

    listCampaignsByProductSchedule({product_schedule, pagination}){

      du.debug('List Campaigns By Product Schedule');

      let product_schedule_id = this.getID(product_schedule);

      let scan_parameters = {
        filter_expression: 'contains(#f1, :product_schedule_id)',
        expression_attribute_names:{
            '#f1': 'productschedules'
        },
        expression_attribute_values: {
            ':product_schedule_id': product_schedule_id
        }
      };

      return this.scanByParameters({parameters: scan_parameters, pagination: pagination});

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

      if(_.has(campaign, "emailtemplates") && arrayutilities.nonEmpty(campaign.emailtemplates)){

        let emailtemplates = arrayutilities.map(campaign.emailtemplates, (id) => {
          return this.executeAssociatedEntityFunction('emailTemplateController', 'get', {id: id});
        });

        return Promise.all(emailtemplates).then((emailtemplates) => {

          return emailtemplates;

        });

      }else{

        return Promise.resolve(null);

      }

    }

    getProducts(campaign){

      du.debug('Get Products');

      if(_.has(campaign, "products") && arrayutilities.nonEmpty(campaign.products)){

        return arrayutilities.map(campaign.products, (id) => {
          return this.executeAssociatedEntityFunction('productController', 'get', {id: id});
        });

      }else{

        return null;

      }

    }

    getProductSchedules(campaign){

      du.debug('Get Product Schedules');

      if(_.has(campaign, "productschedules") && arrayutilities.nonEmpty(campaign.productschedules)){

        return arrayutilities.map(campaign.productschedules, (id) => {
          return this.executeAssociatedEntityFunction('productScheduleController', 'get', {id: id});
        });

      }else{

          return null;

      }

    }

    getProductSchedulesHydrated(campaign){

      du.debug('Get Product Schedule Hydrated');

      if(_.has(campaign, "productschedules") && arrayutilities.nonEmpty(campaign.productschedules)){

        return Promise.all(arrayutilities.map(campaign.productschedules, (id) => {
          return this.executeAssociatedEntityFunction('productScheduleController', 'getProductScheduleHydrated', {id: id});
        }));

      }else{
        return null;
      }
    }

    getAffiliate(campaign){

      du.debug('Get Affiliate');

      return this.executeAssociatedEntityFunction('affiliateController', 'get', {id: campaign.affiliate});

    }

    hydrate(campaign){

      return this.getProductSchedulesHydrated(campaign).then((product_schedules) => {

          campaign.productschedules = product_schedules;

          return campaign;

      });

    }

    getHydratedCampaign(id) {

      return this.get({id: id}).then((campaign) => this.hydrate(campaign));

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
