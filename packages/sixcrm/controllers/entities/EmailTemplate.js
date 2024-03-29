
const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class EmailTemplateController extends entityController {

	constructor(){

		super('emailtemplate');

		this.search_fields = ['name'];

	}

	update({entity, ignore_updated_at}) {
		return this.get({id: entity.id}).then(original_entity => {
			if (original_entity && original_entity.built_in && global.account !== '*') {
				throw eu.getError('server', `Unable to update ${this.descriptive_name} with ID ${entity.id}. Entity is built-in.`);
			}

			return super.update({entity, ignore_updated_at})
		})
	}

	updateBuiltIn({entity, ignore_updated_at}) {
		return this.get({id: entity.id, fatal: true}).then(original_entity => {
			['subject', 'smtp_provider', 'enabled'].forEach(key => {
				original_entity[key] = entity[key];
			});

			return super.update({original_entity, ignore_updated_at})
		})
	}

	updateAssociation({entity, ignore_updated_at}) {
		return super.update({entity, ignore_updated_at})
	}

	delete({id, range_key = null}) {
		return this.get({id: id}).then(original_entity => {
			if (original_entity && original_entity.built_in && global.account !== '*') {
				throw eu.getError('server', `Unable to delete ${this.descriptive_name} with ID ${id}. Entity is built-in.`);
			}

			return super.delete({id, range_key})
		})

	}

	listBySMTPProvider({smtpprovider: smtpprovider, pagination: pagination}){
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

	templatesByAccount({account}) {
		return super.listByAccount({account: account}).then(r => {
			if (!r || !r.emailtemplates) return [];

			return r.emailtemplates.filter(template => template.account === account)})
	}

	getSMTPProvider(emailtemplate){
		if(_.has(emailtemplate, 'smtp_provider')){
			return this.executeAssociatedEntityFunction('SMTPProviderController', 'get', {id: emailtemplate.smtp_provider});

		}else{
			return Promise.resolve(null);

		}

	}

}

