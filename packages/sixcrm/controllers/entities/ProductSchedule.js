const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const { getProductSetupService, LegacyProduct } = require('@6crm/sixcrm-product-setup');

const ProductScheduleHelper = global.SixCRM.routes.include('helpers', 'entities/productschedule/ProductSchedule.js');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class ProductScheduleController extends entityController {

	constructor(){

		super('productschedule');

		this.productScheduleHelper = new ProductScheduleHelper();

		this.search_fields = ['name'];

	}

	create({entity, parameters}) {
		if (this.permissionutilities.areACLsDisabled() || !entity.schedule) {
			return super.create({entity, parameters});
		}

		if (entity.schedule.length > 1) {
			du.warning('Product schedule can only have 1 product.', entity.name);
			throw eu.getError('forbidden', 'Product schedule can only have 1 product.');
		}

		return super.create({entity, parameters});
	}

	async update({entity, ignore_updated_at}) {
		if (entity.schedule.length > 1) {

			const already_existing_schedule_length = _(await this.get({id: entity.id, fatal: true})).get('schedule.length', 0);

			if (already_existing_schedule_length < entity.schedule.length) {
				du.warning('Product schedule can only have 1 product.', entity.name);
				throw eu.getError('forbidden', 'Product schedule can only have 1 product.');
			}

		}

		return super.update({entity, ignore_updated_at});
	}



	//Technical Debt: Deprecated
	getCampaigns(args){
		//Technical Debt:  This looks redundant.
		let product_schedule_id = this.getID(args.productschedule);

		return this.executeAssociatedEntityFunction('CampaignController', 'listCampaignsByProductSchedule', {productschedule: product_schedule_id, pagination: args.pagination});

	}

	getByIds(ids) {

		return this.batchGet({ids});

	}

	listByProduct({product, pagination}){
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
		if(!_.has(product_schedule, 'merchantprovidergroup')){ return Promise.resolve(null); }

		return this.executeAssociatedEntityFunction('MerchantProviderGroupController', 'get', {id: product_schedule.merchantprovidergroup});

	}

	async getProduct(scheduled_product){
		let product_id = _.has(scheduled_product, 'product') ? scheduled_product.product : scheduled_product.product_id;

		//Technical Debt: Hack
		if(_.isNull(product_id) || _.isUndefined(product_id)){ return Promise.resolve(null) }

		try {
			const product = await getProductSetupService().getProduct(product_id);
			return LegacyProduct.hybridFromProduct(product);
		} catch (e) {
			du.error('Cannot retrieve product on account', e);
			return null;
		}
	}

	async getProducts(product_schedule){
		if(_.has(product_schedule, 'schedule') && arrayutilities.nonEmpty(product_schedule.schedule)){

			let product_ids = arrayutilities.map(product_schedule.schedule, (product_schedule) => {
				let id;

				if (_.isString(product_schedule.product)) {
					id = product_schedule.product;
				} else if (_.isObject(product_schedule.product)) {
					id = product_schedule.product.id;
				} else if (_.isString(product_schedule.product_id)) { //Techincal Debt: accounting for legacy deta, remove at earliest convenience
					id = product_schedule.product_id
				}

				return id;

			});

			if(arrayutilities.nonEmpty(product_ids)){
				const products = (await getProductSetupService().getProductsByIds(
					product_ids
				)).map(product => LegacyProduct.hybridFromProduct(product));

				return {
					products
				};
			}

		}

		return Promise.null;

	}

	//Technical Debt:  Can we make this work better?
	getProductScheduleHydrated(id){
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
		let query_parameters = this.createINQueryParameters({field: 'id', list_array: product_schedules});

		return this.listByAccount({query_parameters: query_parameters});

	}

	listByMerchantProviderGroup({merchantprovidergroup, pagination}){
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
