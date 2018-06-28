

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class AffiliateController extends entityController {

	constructor(){

		super('affiliate');

		this.search_fields = ['name', 'affiliate_id'];

	}

	getByAffiliateID(affiliate_id){

		du.debug('Get By Affiliate ID');

		return this.getBySecondaryIndex({field: 'affiliate_id', index_value: affiliate_id, index_name:'affiliate_id-index'});

	}

	getByIds(ids) {

		return this.batchGet({ids});

	}

	getCampaigns({affiliate, pagination}){

		du.debug('Get Campaigns');

		return this.executeAssociatedEntityFunction('SessionController', 'listByAffiliate', {affiliate: affiliate, pagination: pagination});

	}

	getTrackers({affiliate, pagination}){

		du.debug('Get Trackers');

		return this.executeAssociatedEntityFunction('TrackerController', 'listByAffiliate', {affiliate: affiliate, pagination: pagination});

	}

}
