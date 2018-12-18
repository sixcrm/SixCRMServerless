
const _ = require('lodash');
const moment = require("moment");

var timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
var du = require('@6crm/sixcrmcore/util/debug-utilities').default;
var eu = require('@6crm/sixcrmcore/util/error-utilities').default;
var arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
var objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const random = require('@6crm/sixcrmcore/util/random').default;
const RebillHelper = global.SixCRM.routes.include('helpers', 'entities/rebill/Rebill.js');
let rebillHelper = new RebillHelper();

const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
let rebillController = new RebillController();

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

const AnalyticsEvent = global.SixCRM.routes.include('helpers', 'analytics/analytics-event.js');

module.exports = class SessionController extends entityController {

	constructor(){

		super('session');

		this.session_length = 3600;
		this.affiliate_fields = [
			'affiliate',
			'subaffiliate_1',
			'subaffiliate_2',
			'subaffiliate_3',
			'subaffiliate_4',
			'subaffiliate_5',
			'cid'
		];

		this.search_fields = ['alias'];

	}

	//Technical Debt: finish!
	//Rebill
	associatedEntitiesCheck(){
		return Promise.resolve([]);
	}

	listByAffiliate({affiliate, pagination}){
		affiliate = this.getID(affiliate);

		let scan_parameters = {
			filter_expression: '#f1 = :affiliate_id or #f2 = :affiliate_id OR #f3 = :affiliate_id OR #f4 = :affiliate_id OR #f5 = :affiliate_id OR #f6 = :affiliate_id OR #f7 = :affiliate_id',
			expression_attribute_names:{
				'#f1': 'affiliate',
				'#f2': 'subaffiliate_1',
				'#f3': 'subaffiliate_2',
				'#f4': 'subaffiliate_3',
				'#f5': 'subaffiliate_4',
				'#f6': 'subaffiliate_5',
				'#f7': 'cid'
			},
			expression_attribute_values: {
				':affiliate_id': affiliate
			}
		};

		return this.listByAccount({query_parameters: scan_parameters, pagination: pagination});

	}

	create({entity}){
		if(!_.has(entity, 'alias')){
			entity.alias = this.createAlias();
		}

		return super.create({entity: entity});

	}

	update({entity, ignore_updated_at}){
		if(!_.has(entity, 'alias')){
			entity.alias = this.createAlias();
		}

		return super.update({entity: entity, ignore_updated_at: ignore_updated_at});

	}

	getCustomer(session){
		if(!_.has(session, "customer")){ return null; }

		return this.executeAssociatedEntityFunction('CustomerController', 'get', {id: session.customer});

	}

	getCampaign(session){
		if(!_.has(session, "campaign")){ return null; }

		return this.executeAssociatedEntityFunction('CampaignController', 'get', {id: session.campaign});

	}

	getSessionCreditCard(session){
		if(!_.has(session, 'customer')){ return null; }

		return this.executeAssociatedEntityFunction('CustomerController', 'getMostRecentCreditCard', {id: session.customer});

	}

	getCampaignHydrated(session){
		var id = session;

		if(_.has(session, "id")){
			id = session.id;
		}

		return this.executeAssociatedEntityFunction('CampaignController', 'getHydratedCampaign', {id: id});

	}

	getAffiliate(session, affiliate_field){
		if(_.has(session, affiliate_field) && this.isUUID(session[affiliate_field])){

			return this.executeAssociatedEntityFunction('AffiliateController', 'get', {id: session[affiliate_field]});

		}else{

			return null;

		}

	}

	getAffiliateIDs(session){
		return this.get({id: session}).then((session) => {

			return arrayutilities.filter(this.affiliate_fields, (affiliate_field) => {

				if(_.has(session, affiliate_field)){

					if(this.isUUID(session[affiliate_field])){

						return session[affiliate_field];

					}else{

						du.warning('Unrecognized affiliate field type: '+session[affiliate_field]);

						return false;

					}

				}

			});

		});

	}

	getAffiliates(session){
		return new Promise((resolve) => {

			return this.get({id: session}).then((session) => {

				let affiliates = arrayutilities.map(this.affiliate_fields, (affiliate_field) => {

					if(_.has(session, affiliate_field)){

						if(this.isUUID(session[affiliate_field])){

							return this.executeAssociatedEntityFunction('AffiliateController', 'get', {id: session[affiliate_field]});

						}else{

							du.warning('Unrecognized affiliate field type: '+session[affiliate_field]);

						}

					}

				});

				if(affiliates.length < 1){

					return resolve(affiliates);

				}

				return Promise.all(affiliates).then((affiliates) => {

					return resolve(affiliates);

				});

			});

		});

	}

	listTransactions(session){
		return this.executeAssociatedEntityFunction('RebillController', 'listBySession', {session: session})
			.then((session_rebills) => {

				if(_.has(session_rebills, 'rebills') && arrayutilities.nonEmpty(session_rebills.rebills)){

					return session_rebills.rebills;

				}

				return null;

			})
			.then(rebills => {

				du.info(rebills);

				if(!_.isNull(rebills) && arrayutilities.nonEmpty(rebills)){

					let rebills_transactions_promises = arrayutilities.map(rebills, (rebill) => {

						return this.executeAssociatedEntityFunction('transactionController', 'listTransactionsByRebillID', {id: this.getID(rebill)});

					});

					return Promise.all(rebills_transactions_promises);

				}

				return null;

			})
			.then(rebills_transactions => {

				if(arrayutilities.isArray(rebills_transactions) && arrayutilities.nonEmpty(rebills_transactions)){

					let return_array = [];

					arrayutilities.map(rebills_transactions, rebill_transactions => {

						if(_.has(rebill_transactions, 'transactions') && arrayutilities.nonEmpty(rebill_transactions.transactions)){

							arrayutilities.map(rebill_transactions.transactions, rebill_transaction => {

								return_array.push(rebill_transaction);

							});

						}

					});

					return (arrayutilities.nonEmpty(return_array))?return_array:null;

				}

				return null;

			});

	}

	listRebills(session){
		return this.executeAssociatedEntityFunction('RebillController', 'listBySession', {session: session})
			.then(rebills => this.getResult(rebills, 'rebills'));

	}

	listProductSchedules(session){
		if(!arrayutilities.nonEmpty(session.product_schedules)){
			return Promise.resolve(null);
		}

		let query_parameters = this.createINQueryParameters({field: 'id', list_array: session.product_schedules});

		return this.executeAssociatedEntityFunction('ProductScheduleController', 'listByAccount', {query_parameters: query_parameters});

	}

	//Technical Debt:  This needs to go to a helper...
	createSessionObject(parameters){
		let session = {
			completed: false
		};

		let session_template = {
			required:{
				customer: 'customer',
				campaign: 'campaign'
			},
			optional:{
				affiliate: 'affiliate',
				subaffiliate_1: 'subaffiliate_1',
				subaffiliate_2: 'subaffiliate_2',
				subaffiliate_3: 'subaffiliate_3',
				subaffiliate_4: 'subaffiliate_4',
				subaffiliate_5: 'subaffiliate_5',
				cid: 'cid'
			}
		};

		session = objectutilities.transcribe(session_template.required, parameters, session, true);

		return objectutilities.transcribe(session_template.optional, parameters, session, false);

	}

	getSessionByCustomer(customer){
		return this.queryBySecondaryIndex({field: 'customer', index_value: this.getID(customer), index_name: 'customer-index'})
			.then((result) => this.getResult(result));

	}

	//Note: Called by the campaign controller only...
	listByCampaign({campaign, pagination}) {
		let query_parameters = {
			filter_expression: '#field = :field_value',
			expression_attribute_names: {
				'#field': 'campaign'
			},
			expression_attribute_values:{
				':field_value': this.getID(campaign)
			}
		}

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

	}

	listByCustomer({customer, pagination}) {
		return this.queryBySecondaryIndex({field: 'customer', index_value: this.getID(customer), index_name: 'customer-index', pagination: pagination});

	}

	closeSession(session){
		session.completed = true;

		return this.updateProperties({id: session, properties: {completed: true}});

	}

	/*
    * Technical Debt Area...
    */

	//Technical Debt:  Needs to be more testable, separate functions
	assureSession(parameters){
		//Technical Debt:  Update this shit validate

		return this.getSessionByCustomer(parameters.customer).then((sessions) => {

			if(arrayutilities.nonEmpty(sessions)){

				let session_found = arrayutilities.find(sessions, (session) => {

					if (session.concluded) {
						return false;
					}

					if(_.has(session, 'completed') && session.completed == false && _.has(session, 'created_at')){

						let created_at_timestamp = timestamp.dateToTimestamp(session.created_at);

						return (timestamp.getTimeDifference(created_at_timestamp) < this.session_length);

					}

					return false;

				});

				if(!_.isUndefined(session_found)){
					return session_found;
				}

			}

			return null;


		}).then(session_found => {

			if(!_.isNull(session_found)){

				du.info('Open session identified.');

				return session_found;

			}else{

				let session_object = this.createSessionObject(parameters);

				session_object = this.prune(session_object)

				return this.create({entity: session_object});

			}

		});

	}

	//Technical Debt:  This needs to move to a prototype?
	hydrate(session){

		return new Promise((resolve) => {

			if(!_.has(session, "campaign")){ return null; }

			this.getCampaignHydrated(session.campaign).then((campaign) => {

				session.campaign = campaign;

				return session;

			}).then((session) => {

				if(!_.has(session, "customer")){ return null; }

				return this.getCustomer(session).then((customer) => {

					session.customer = customer;

					return session;

				}).then((session) => {

					return resolve(session);

				}).catch((error) => {

					throw error;

				});

			}).catch((error) => {

				throw error;

			});

		});

	}

	//Technical Debt: gross
	getSessionHydrated(id){

		return this.get({id: id}).then((session) => {

			return this.hydrate(session);

		});

	}

	//Technical Debt:  This should be List Products
	listProducts(session){
		return this.listTransactions(session).then((session_rebill_transactions) => {

			if(arrayutilities.nonEmpty(session_rebill_transactions)){

				let product_promises = arrayutilities.map(session_rebill_transactions, (session_rebill_transaction) => {

					return this.executeAssociatedEntityFunction('transactionController', 'getProducts', session_rebill_transaction);

				});

				return Promise.all(product_promises);

			}

			return [];

		}).then((session_rebill_transaction_products) => {

			//du.info('Session Rebill Transaction Products', session_rebill_transaction_products);

			let return_array = [];

			if(arrayutilities.nonEmpty(session_rebill_transaction_products)){
				arrayutilities.map(session_rebill_transaction_products, (rebill_transaction_products) => {
					if(arrayutilities.nonEmpty(rebill_transaction_products)){
						arrayutilities.map(rebill_transaction_products, (rebill_transaction_product) => {
							return_array.push(rebill_transaction_product);
						});
					}
				});
			}

			return return_array;

		});

	}

	createAlias(){

		let alias = random.createRandomString(9);

		return 'S'+alias;

	}

	getUser(session){
		return this.executeAssociatedEntityFunction('userController', 'get', {id: session.cancelled_by}).then(data => {
			du.error('cancelled_by', data)
			return data;
		})

	}

	cancelSession({entity}){
		return this.executeAssociatedEntityFunction('SessionController', 'get', {id: entity.id}).then(session => {

			if(!session){

				throw eu.getError('not_found','Unable to update '+this.descriptive_name+' with ID: "'+entity.id+'" -  record doesn\'t exist.');

			}

			delete entity.id;
			entity.cancelled_at = timestamp.getISO8601();
			session.cancelled = entity;

			session = this.trimSessionWatermark(session);

			return this.update({entity: session}).then(() => this.listRebills(session)).then(rebills => {
				if (!rebills || !rebills.length) {
					return []
				}

				return rebills.filter(r => !rebillHelper.isAvailable({rebill: r})).filter(r => !r.processing);
			}).then(futureRebills => {
				return Promise.all(futureRebills.map(r => rebillController.delete({id: r.id}))).then(() => session);
			}).then(() => {

				let EventsHelperController = global.SixCRM.routes.include('helpers', 'events/Event.js');
				let eventHelperController = new EventsHelperController();

				let context = {
					session: session,
					campaign: session.campaign,
					customer: session.customer,
				};

				return eventHelperController.pushEvent({event_type: 'cancellation', context: context}).then(result => {
					du.info(result);

					return session;
				});
			}).then(() => {

				return AnalyticsEvent.push('cancelSession', { id: session.id }).then(() => session);

			});

		});


	}

	trimSessionWatermark(session) {
		if (_.has(session.watermark, 'product_schedules')) {
			const end = moment.utc().diff(session.created_at, 'd');

			session.watermark.product_schedules.forEach((quantifiableSchedule) => {

				if (!quantifiableSchedule.product_schedule.schedule) return;

				quantifiableSchedule.product_schedule.schedule =
					quantifiableSchedule.product_schedule.schedule.filter(schedule => schedule.start < end);

				quantifiableSchedule.product_schedule.schedule.forEach((schedule) => {
					if (!schedule.end || schedule.end > end) {
						schedule.end = end;
					}
				})

			});
		}

		return session;
	}

}
