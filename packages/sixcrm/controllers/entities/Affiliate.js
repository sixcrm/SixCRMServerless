var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class AffiliateController extends entityController {

	constructor(){

		super('affiliate');

		this.search_fields = ['name', 'affiliate_id'];

	}

	getByAffiliateID(affiliate_id){
		return this.getBySecondaryIndex({field: 'affiliate_id', index_value: affiliate_id, index_name:'affiliate_id-index'});

	}

	getByIds(ids) {

		return this.batchGet({ids});

	}

	getCampaigns({affiliate, pagination}){
		return this.executeAssociatedEntityFunction('SessionController', 'listByAffiliate', {affiliate: affiliate, pagination: pagination});

	}

	getTrackers({affiliate, pagination}){
		return this.executeAssociatedEntityFunction('TrackerController', 'listByAffiliate', {affiliate: affiliate, pagination: pagination});

	}

}
