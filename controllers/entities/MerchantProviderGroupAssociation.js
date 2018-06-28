

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class MerchantProviderGroupAssociationController extends entityController {

	constructor(){

		super('merchantprovidergroupassociation');

	}

	getMerchantProviderGroup(merchantprovidergroupassociation){

		du.debug('Get MerchantProviderGroup');

		return this.executeAssociatedEntityFunction(
			'MerchantProviderGroupController',
			'get',
			{id: merchantprovidergroupassociation.merchantprovidergroup}
		);

	}

	getCampaign(merchantprovidergroupassociation){

		du.debug('Get Campaign');

		return this.executeAssociatedEntityFunction(
			'CampaignController',
			'get',
			{id: merchantprovidergroupassociation.campaign}
		);

	}

	//Technical Debt:  This seems hacky
	listByEntitiesAndCampaign({entities, campaign}){

		du.debug('List Merchant Provider Groups By Entity and Campaign');

		let query_parameters = this.createINQueryParameters({field:'entity', list_array: entities});

		query_parameters.filter_expression += ' AND #campaign = :campaignv';
		query_parameters.expression_attribute_names = {'#campaign': 'campaign'};
		query_parameters.expression_attribute_values[':campaignv'] = this.getID(campaign);

		return this.listByAccount({query_parameters: query_parameters});

	}

	listByEntity({entity, pagination, fatal, search}){

		du.debug('List Merchant Provider Groups By Entity');

		let query_parameters = {
			filter_expression:'#entity = :entityv',
			expression_attribute_names: {'#entity': 'entity'},
			expression_attribute_values: {':entityv': this.getID(entity)}
		};

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination, fatal: fatal, search: search});

	}

	listByCampaign({campaign}){

		du.debug('List Merchant Provider Groups By Campaign');

		let query_parameters = {
			filter_expression:'#campaign = :campaignv',
			expression_attribute_names: {'#campaign': 'campaign'},
			expression_attribute_values: {':campaignv': this.getID(campaign)}
		};

		return this.listByAccount({query_parameters: query_parameters});

	}

}

