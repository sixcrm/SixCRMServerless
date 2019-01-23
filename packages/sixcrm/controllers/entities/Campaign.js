
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const entityController = require('./Entity');
const AccountController = require('./Account');

module.exports = class CampaignController extends entityController {

	constructor(){

		super('campaign');

		this.search_fields = ['name'];

		this.accountController = new AccountController();
	}

	async create(argumentation) {
		this.affiliateCheck(argumentation.entity);

		if (global.account === '*' || this.permissionutilities.areACLsDisabled()) {
			return super.create(argumentation);
		}

		const account = await this.accountController.get({id: global.account});
		const plan = _(account).get('billing.plan', null);

		if (!plan || plan !== 'basic') {
			return super.create(argumentation);
		}

		const campaignCount = _(await this.list({pagination: {limit: 1}})).get('pagination.count', 0);


		if (campaignCount > 0) {
			throw eu.getError('forbidden', 'Your subscription level does not allow creating more campaigns.');
		}
		return super.create(argumentation);

	}

	async update({entity, ignore_updated_at}) {
		this.affiliateCheck(entity);

		return super.update({entity, ignore_updated_at});
	}

	affiliateCheck(entity) {
		if (!entity.affiliate_allow || !entity.affiliate_deny) {
			return;
		}

		const affiliate_intersection = entity.affiliate_allow
			.filter(allow => entity.affiliate_deny.includes(allow))
			.filter(affiliate => affiliate !== '*');

		if (affiliate_intersection.length) {
			throw eu.getError('bad_request', 'affiliate_allow and affiliate_deny should have different values')
		}
	}

	associatedEntitiesCheck({id}){
		let return_array = [];

		let data_acquisition_promises = [
			this.executeAssociatedEntityFunction('SessionController', 'listByCampaign', {campaign:id}).then(sessions => this.getResult(sessions, 'sessions')),
			this.executeAssociatedEntityFunction('TrackerController', 'listByCampaign', {campaign:id}).then(trackers => this.getResult(trackers, 'trackers')),
			this.executeAssociatedEntityFunction('MerchantProviderGroupAssociationController', 'listByCampaign', {campaign:id}).then(merchantprovidergroupassociations => this.getResult(merchantprovidergroupassociations, 'merchantprovidergroupassociations'))
		];

		return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

			let sessions = data_acquisition_promises[0];
			let trackers = data_acquisition_promises[1];
			let merchantprovidergroupassociations = data_acquisition_promises[2];

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

			if(arrayutilities.nonEmpty(merchantprovidergroupassociations)){
				arrayutilities.map(merchantprovidergroupassociations, (merchantprovidergroupassociation) => {
					return_array.push(this.createAssociatedEntitiesObject({name:'MerchantProviderGroupAssociation', object:merchantprovidergroupassociation}));
				});
			}

			return return_array;

		});

	}

	getAffiliateAllowDenyList(list){
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
			return this.executeAssociatedEntityFunction('AffiliateController', 'listBy', {list_array: affiliate_ids})
				.then((affiliates) => this.getResult(affiliates, 'affiliates'))
				.then(affiliates_array => {
					if(arrayutilities.nonEmpty(affiliates_array)){
						return arrayutilities.merge(affiliates_array, return_array)
					}
					return return_array;
				});

		}

		return Promise.resolve(null);


	}

	listAffiliatesByCampaign({affiliate, pagination}){
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

		return this.executeAssociatedEntityFunction('SessionController', 'queryByParameters', {query_parameters: query_parameters, pagination: pagination});

	}

	listCampaignsByProductSchedule({productschedule, pagination}){
		return this.listByAssociations({field: 'productschedules', id: this.getID(productschedule), pagination: pagination});

	}

	getEmailTemplates(campaign){
		if(_.has(campaign, "emailtemplates") && arrayutilities.nonEmpty(campaign.emailtemplates)){

			return this.executeAssociatedEntityFunction('EmailTemplateController', 'listBy', {list_array: campaign.emailtemplates})
				.then(emailtemplates => this.getResult(emailtemplates, 'emailtemplates'));

		}else{

			return Promise.resolve(null);

		}

	}

	getProductSchedules(campaign){
		if(_.has(campaign, "productschedules") && arrayutilities.nonEmpty(campaign.productschedules)){

			return this.executeAssociatedEntityFunction('ProductScheduleController', 'listBy', {list_array: campaign.productschedules})
				.then(productschedules => this.getResult(productschedules, 'productschedules'));

		}else{

			return Promise.resolve(null);

		}

	}

	listByAffiliateAllow({affiliate, pagination}){
		return this.listByAssociations({id: this.getID(affiliate), field: 'affiliate_allow', pagination: pagination});

	}

	listByAffiliateDeny({affiliate, pagination}){
		return this.listByAssociations({id: this.getID(affiliate), field: 'affiliate_deny', pagination: pagination});

	}

	getByIds(ids) {

		return this.batchGet({ids});

	}

	getAffiliate(campaign){
		return this.executeAssociatedEntityFunction('AffiliateController', 'get', {id: campaign.affiliate});

	}

	/*
    * Technical Debt Below...
    */

	//Technical Debt:  This seems VERY general in terms of parameterization
	//Technical Debt:  Replace with listBy()
	//Technical Debt:  Use a better query method instead of iterating over "listCampaignsByProductSchedule()"
	listCampaignsByProduct({product, pagination}){
		return this.executeAssociatedEntityFunction('ProductScheduleController', 'listByProduct', {product: this.getID(product)})
			.then((productschedules) => this.getResult(productschedules, 'productschedules'))
			.then((productschedules) => {

				du.warning('Product Schedules:', productschedules);

				let campaigns = arrayutilities.map(productschedules, (productschedule) => {
					return this.listCampaignsByProductSchedule({productschedule: this.getID(productschedule), pagination: pagination})
				});

				//Technical Debt: everything below this is clumsy...
				return Promise.all(campaigns).then((responses) => {
					let return_array = [];

					arrayutilities.map(responses, (response) => {
						if(arrayutilities.nonEmpty(response.campaigns)){
							arrayutilities.map(response.campaigns, campaign => {
								return_array.push(campaign);
							});
						}
					});

					//Inelegant
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

			});

	}

	//Technical Debt:  Need compound condition here...
	getEmailTemplatesByEventType(campaign, event_type){
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
		if(_.has(campaign, "productschedules") && arrayutilities.nonEmpty(campaign.productschedules)){

			return Promise.all(arrayutilities.map(campaign.productschedules, (id) => {
				return this.executeAssociatedEntityFunction('ProductScheduleController', 'getProductScheduleHydrated', {id: id});
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
