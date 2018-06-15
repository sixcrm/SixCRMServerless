
const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;

const ProductScheduleHelper = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class ProductScheduleController extends entityController {

	constructor(){

		super('productschedule');

		this.productScheduleHelper = new ProductScheduleHelper();

		this.search_fields = ['name'];

	}

	//Technical Debt: Deprecated
	getCampaigns(args){

		du.debug('Get Campaigns');

		//Technical Debt:  This looks redundant.
		let product_schedule_id = this.getID(args.productschedule);

		return this.executeAssociatedEntityFunction('CampaignController', 'listCampaignsByProductSchedule', {productschedule: product_schedule_id, pagination: args.pagination});

	}

	getByIds(ids) {

		return this.batchGet({ids});

	}

	listByProduct({product, pagination}){

		du.debug('List By Product');

		let product_id = this.getID(product);

		return this.listByAccount({pagination: pagination})
			.then((productschedules) => this.getResult(productschedules, 'productschedules'))
			.then((productschedules) => {

				let return_array = [];

				if(arrayutilities.nonEmpty(productschedules)){

					arrayutilities.map(productschedules, productschedule => {

						if(arrayutilities.nonEmpty(productschedule.schedule)){

							let found = arrayutilities.find(productschedule.schedule, (schedule) => {
								return (_.has(schedule, 'product') && schedule.product == product_id);
							});

							if(!_.isUndefined(found)){
								return_array.push(productschedule);
							}
						}

					});

				}

				return {
					productschedules: return_array,
					pagination: this.buildPaginationObject({
						Count: return_array.length
					})
				}

			});

	}

	getMerchantProviderGroup(product_schedule){

		du.debug('Get Merchant Provider Group');

		if(!_.has(product_schedule, 'merchantprovidergroup')){ return Promise.resolve(null); }

		return this.executeAssociatedEntityFunction('MerchantProviderGroupController', 'get', {id: product_schedule.merchantprovidergroup});

	}

	getProduct(scheduled_product){

		du.debug('Get Product');

		let product_id = _.has(scheduled_product, 'product') ? scheduled_product.product : scheduled_product.product_id;

		//Technical Debt: Hack
		if(_.isNull(product_id) || _.isUndefined(product_id)){ return Promise.resolve(null) }

		return this.executeAssociatedEntityFunction('ProductController', 'get', {id: product_id});

	}

	getProducts(product_schedule){

		du.debug('Get Products');

		if(_.has(product_schedule, 'schedule') && arrayutilities.nonEmpty(product_schedule.schedule)){

			let product_ids = arrayutilities.map(product_schedule.schedule, (product_schedule) => {

				//Techincal Debt: accounting for legacy deta, remove at earliest convenience
				return _.has(product_schedule, 'product') ? product_schedule.product : product_schedule.product_id;

			});

			if(arrayutilities.nonEmpty(product_ids)){

				let query_parameters = this.createINQueryParameters({field: 'id', list_array: product_ids});

				du.debug(query_parameters);
				return this.executeAssociatedEntityFunction('ProductController', 'listByAccount', {query_parameters: query_parameters});

			}

		}

		return Promise.null;

	}

	//Technical Debt:  Can we make this work better?
	getProductScheduleHydrated(id){

		du.debug('Get Product Schedule Hydrated');

		return this.get({id: id}).then((product_schedule) => {

			if(_.has(product_schedule, 'schedule')){

				return this.getProducts(product_schedule).then((products) => {

					return this.productScheduleHelper.marryProductsToSchedule({product_schedule: product_schedule, products: products});

				});

			}else{

				return product_schedule;

			}

		});

	}

	listProductSchedulesByList({product_schedules}){

		du.debug('List Product Schedules By List');

		let query_parameters = this.createINQueryParameters({field: 'id', list_array: product_schedules});

		return this.listByAccount({query_parameters: query_parameters});

	}

	listByMerchantProviderGroup({merchantprovidergroup, pagination}){

		du.debug('List By Merchant Provider Group');

		let query_parameters = {
			filter_expression: '#f1 = :merchantprovidergroup_id',
			expression_attribute_values: {
				':merchantprovidergroup_id':this.getID(merchantprovidergroup)
			},
			expression_attribute_names: {
				'#f1':'merchantprovidergroup'
			}
		};

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

	}

}
