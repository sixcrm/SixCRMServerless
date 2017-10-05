'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class campaignController extends entityController {

    constructor(){

      super('campaign');

    }

    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('sessionController', 'listByCampaign', {campaign:id}).then(sessions => this.getResult(sessions, 'sessions')),
        this.executeAssociatedEntityFunction('trackerController', 'listByCampaign', {campaign:id}).then(trackers => this.getResult(trackers, 'trackers'))
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let sessions = data_acquisition_promises[0];
        let trackers = data_acquisition_promises[1];

        if(arrayutilities.nonEmpty(sessions)){
          arrayutilities.map(sessions, (session) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Session', object: session}));
          });
        }

        if(arrayutilities.nonEmpty(trackers)){
          arrayutilities.map(trackers, (tracker) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Tracker', object:tracker}));
          });
        }

        return return_array;

      });

    }

    getAffiliateAllowDenyList(list){

      du.debug('Get Affiliate Allow Deny List');

      if(!arrayutilities.nonEmpty(list)){
        return Promise.resolve(null);
      }

      let return_array = [];

      let affiliate_ids = arrayutilities.filter(list, (list_item) => {

        if(this.isUUID(list_item)){
          return true;
        }

        if(list_item == '*'){
          return_array.push({id:'*', name:'All'});
        }

        return false;

      });

      if(arrayutilities.nonEmpty(affiliate_ids)){

        return this.executeAssociatedEntityFunction('affiliateController', 'listBy', {list_array: affiliate_ids})
        .then((affiliates) => this.getResult(affiliates, 'affiliates'))
        .then(affiliates_array => {
          return arrayutilities.merge(affiliates_array, return_array)
        });

      }

      return Promise.resolve(null);


    }

    listAffiliatesByCampaign({affiliate, pagination}){

      du.debug('List Affiliates By Campaign');

      let affiliate_id = this.getID(affiliate);

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

      return this.executeAssociatedEntityFunction('sessionController', 'queryByParameters', {query_parameters: query_parameters, pagination: pagination});

    }

    listCampaignsByProductSchedule({product_schedule, pagination}){

      du.debug('List Campaigns By Product Schedule');

      return this.listByAssociations({field: 'productschedules', id: this.getID(product_schedule), pagination: pagination});

    }

    getEmailTemplates(campaign){

      du.debug('Get Email Templates');

      if(_.has(campaign, "emailtemplates") && arrayutilities.nonEmpty(campaign.emailtemplates)){

        return this.executeAssociatedEntityFunction('emailTemplateController', 'listBy', {list_array: campaign.emailtemplates})
        .then(emailtemplates => this.getResult(emailtemplates, 'emailtemplates'));

      }else{

        return Promise.resolve(null);

      }

    }

    getProducts(campaign){

      du.debug('Get Products');

      if(_.has(campaign, "products") && arrayutilities.nonEmpty(campaign.products)){

        return this.executeAssociatedEntityFunction('productController', 'listBy', {list_array: campaign.products})
        .then(products => this.getResult(products, 'products'));

      }else{

        return Promise.resolve(null);

      }

    }

    getProductSchedules(campaign){

      du.debug('Get Product Schedules');

      if(_.has(campaign, "productschedules") && arrayutilities.nonEmpty(campaign.productschedules)){

        return this.executeAssociatedEntityFunction('productScheduleController', 'listBy', {list_array: campaign.productschedules})
        .then(productschedules => this.getResult(productschedules, 'productschedules'));

      }else{

          return Promise.resolve(null);

      }

    }

    validateProductSchedules(product_schedules, campaign){

      du.debug('Validate Product Schedules');

      objectutilities.has(campaign, ['productschedules'], true);

      arrayutilities.nonEmpty(campaign.productschedules, true);

      arrayutilities.map(product_schedules, product_schedule => {

        let found = arrayutilities.find(campaign.productschedules, campaign_product_schedule => {

          return (this.getID(campaign_product_schedule) == this.getID(product_schedule));

        });

        if(_.isUndefined(found)){

          eu.throwError('server','Product schedule does not agree with campaign product schedule: '+product_schedule);

        }

      });

      return true;

    }

    listByAffiliateAllow({affiliate, pagination}){

      du.debug('List by Affiliate Allow');

      return this.listByAssociations({id: this.getID(affiliate), field: 'affiliate_allow', pagination: pagination});

    }

    listByAffiliateDeny({affiliate, pagination}){

      du.debug('List by Affiliate Deny');

      return this.listByAssociations({id: this.getID(affiliate), field: 'affiliate_deny', pagination: pagination});

    }

    getAffiliate(campaign){

      du.debug('Get Affiliate');

      return this.executeAssociatedEntityFunction('affiliateController', 'get', {id: campaign.affiliate});

    }

    /*
    * Technical Debt Below...
    */

    //Technical Debt:  This seems VERY general in terms of parameterization
    //Technical Debt:  Replace with listBy()
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

    //Technical Debt:  Need compound condition here...
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

    //Technical Debt: Gross
    //Technical Debt:  Replace with listBy()
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

    //Technical Debt: Gross
    hydrate(campaign){

      return this.getProductSchedulesHydrated(campaign).then((product_schedules) => {

          campaign.productschedules = product_schedules;

          return campaign;

      });

    }

    //Technical Debt: Gross
    getHydratedCampaign(id) {

      return this.get({id: id}).then((campaign) => this.hydrate(campaign));

    }

}

module.exports = new campaignController();
