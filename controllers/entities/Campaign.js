'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');

var productController = global.routes.include('controllers', 'entities/Product.js');
var loadBalancerController = global.routes.include('controllers', 'entities/LoadBalancer.js');
var productScheduleController = global.routes.include('controllers', 'entities/ProductSchedule.js');
var affiliateController = global.routes.include('controllers', 'entities/Affiliate.js');
var emailTemplateController = global.routes.include('controllers', 'entities/EmailTemplate.js');
var entityController = global.routes.include('controllers', 'entities/Entity.js');

class campaignController extends entityController {

    constructor(){
        super('campaign');
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

            let acquisitions = campaign.emailtemplates.map(id => emailTemplateController.get(id));

            return Promise.all(acquisitions).then((acquisitions) => {

                return acquisitions;

            });

        }else{

            return Promise.resolve(null);

        }

    }

    getProducts(campaign){

        if(_.has(campaign, "products")){

            return campaign.products.map(id => productController.get(id));

        }else{

            return null;

        }

    }

    getLoadBalancerHydrated(campaign){

        return loadBalancerController.getLoadBalancerHydrated(campaign.loadbalancer);

    }

    getLoadBalancer(campaign){

        return loadBalancerController.get(campaign.loadbalancer);

    }

    getProductSchedules(campaign){

        if(_.has(campaign, "productschedules")){

            return campaign.productschedules.map(id => productScheduleController.get(id));

        }else{

            return null;

        }

    }

    getProductSchedulesHydrated(campaign){

        if(_.has(campaign, "productschedules")){

            return Promise.all(campaign.productschedules.map(id => productScheduleController.getProductScheduleHydrated(id)));

        }else{

            return null;

        }

    }

    getAffiliate(campaign){

        return affiliateController.get(campaign.affiliate);

    }

	// is there a better way?
    hydrate(campaign){

        var controller_instance = this;

        return new Promise((resolve) => {

            return controller_instance.getLoadBalancerHydrated(campaign).then((loadbalancer) => {

                campaign.loadbalancer = loadbalancer;

                return campaign;

            }).then((campaign) =>{

                return controller_instance.getProductSchedulesHydrated(campaign).then((product_schedules) => {

                    campaign.productschedules = product_schedules;

                    return campaign;

                }).then((campaign) => {

                    return resolve(campaign);

					/*
					controller_instance.getAffiliate(campaign).then((affiliate) => {

						campaign.affiliate = affiliate;

						resolve(campaign);

					}).catch((error) => {
						throw error;
					});
					*/

                });
            }).then((campaign) => {
                return campaign;
            });

        });

    }

    getHydratedCampaign(id) {

        return this.get(id).then((campaign) => {

            return this.hydrate(campaign);

        });

    }

    validateProductSchedules(product_schedules, campaign){

        if(!_.has(campaign, 'productschedules') || !_.isArray(campaign.productschedules) || campaign.productschedules.length < 1){

            throw new Error('Invalid product schedule.');

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

                throw new Error('Product schedule does not agree with campaign product schedule: '+product_schedules[i].id);

            }

        }

        return true;

    }

}

module.exports = new campaignController();
