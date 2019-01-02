var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class MerchantProviderGroupAssociationController extends entityController {

	constructor(){

		super('merchantprovidergroupassociation');

	}

	getMerchantProviderGroup(merchantprovidergroupassociation){
		return this.executeAssociatedEntityFunction(
			'MerchantProviderGroupController',
			'get',
			{id: merchantprovidergroupassociation.merchantprovidergroup}
		);

	}

	getCampaign(merchantprovidergroupassociation){
		return this.executeAssociatedEntityFunction(
			'CampaignController',
			'get',
			{id: merchantprovidergroupassociation.campaign}
		);

	}

	//Technical Debt:  This seems hacky
	listByEntitiesAndCampaign({entities, campaign}){
		let query_parameters = this.createINQueryParameters({field:'entity', list_array: entities});

		query_parameters.filter_expression += ' AND #campaign = :campaignv';
		query_parameters.expression_attribute_names = {'#campaign': 'campaign'};
		query_parameters.expression_attribute_values[':campaignv'] = this.getID(campaign);

		return this.listByAccount({query_parameters: query_parameters});

	}

	listByEntity({entity, pagination, fatal, search}){
		let query_parameters = {
			filter_expression:'#entity = :entityv',
			expression_attribute_names: {'#entity': 'entity'},
			expression_attribute_values: {':entityv': this.getID(entity)}
		};

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination, fatal: fatal, search: search});

	}

	listByCampaign({campaign}){
		let query_parameters = {
			filter_expression:'#campaign = :campaignv',
			expression_attribute_names: {'#campaign': 'campaign'},
			expression_attribute_values: {':campaignv': this.getID(campaign)}
		};

		return this.listByAccount({query_parameters: query_parameters});

	}

}

