
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class EmailTemplateController extends entityController {

	constructor(){

		super('emailtemplate');

		this.search_fields = ['name'];

	}

	listBySMTPProvider({smtpprovider: smtpprovider, pagination: pagination}){

		du.debug('List By SMTP Provider');

		let query_parameters = {
			filter_expression: '#f1 = :smtpprovider_id',
			expression_attribute_values: {
				':smtpprovider_id':this.getID(smtpprovider)
			},
			expression_attribute_names: {
				'#f1':'smtp_provider'
			}
		};

		//Technical Debt:  Use listByAccount()
		return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

	}

	listByCampaign(campaign) {
		return this.listByAccount({}).then(r => {
			if (!r || !r.emailtemplates) return [];

			return r.emailtemplates.filter(template => {
				if (!template.campaigns) return false;

				return template.campaigns.includes(campaign.id)
			} )})
	}

	listByProduct(product) {
		return this.listByAccount({}).then(r => {
			if (!r || !r.emailtemplates) return [];

			return r.emailtemplates.filter(template => {
				if (!template.products) return false;

				return template.products.includes(product.id)
			} )})
	}

	listByProductSchedule(product_schedule) {
		return this.listByAccount({}).then(r => {
			if (!r || !r.emailtemplates) return [];

			return r.emailtemplates.filter(template => {
				if (!template.product_schedules) return false;

				return template.product_schedules.includes(product_schedule.id)
			} )})
	}

	listByAccount({account}) {
		return super.listByAccount({account: account}).then(r => {
			if (!r || !r.emailtemplates) return [];

			return r.emailtemplates.filter(template => template.account === account)})
	}

	getSMTPProvider(emailtemplate){

		du.debug('Get SMTP Provider', emailtemplate);

		if(_.has(emailtemplate, 'smtp_provider')){

			du.debug('Get SMTP Provider - returning from controller.');

			return this.executeAssociatedEntityFunction('SMTPProviderController', 'get', {id: emailtemplate.smtp_provider});

		}else{

			du.debug('Get SMTP Provider - returning null.');

			return Promise.resolve(null);

		}

	}

}

