
const _ = require('lodash');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const { createProductSetupService, getProductSetupService } = require('@6crm/sixcrm-product-setup');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
const ProductScheduleController = global.SixCRM.routes.include('controllers', 'entities/ProductSchedule.js');

const getEnvironmentAuroraHost = () => global.SixCRM.configuration.getEnvironmentConfig(`aurora_host`);
const getAuroraConfig = async () => {
	const {
		host = await getEnvironmentAuroraHost(),
		user: username,
		password
	} = global.SixCRM.configuration.site_config.aurora;
	return {
		host,
		username,
		password
	};
};

module.exports = class InfoController extends transactionEndpointController{

	constructor(){

		super();

		this.required_permissions = [
			'product/read',
			'productschedule/read'
		];

		this.parameter_definitions = {
			execute: {
				required : {
					event:'event'
				}
			}
		};

		this.parameter_validation = {
			'event':global.SixCRM.routes.path('model', 'endpoints/info/event.json'),
			'products':global.SixCRM.routes.path('model', 'entities/components/products.json'),
			'product_schedules':global.SixCRM.routes.path('model', 'entities/components/productschedules.json')
		};

		this.productScheduleController = new ProductScheduleController();

		this.initialize();

	}

	async preamble(event) {
		await super.preamble(event);

		// Pull accountId off of the event to workaround a race condition
		// where global.account has not been defined or is wrong
		const { pathParameters: { account: accountId }} = event;
		const auroraConfig = await getAuroraConfig();
		const productSetupServiceOptions = {
			accountId,
			...auroraConfig
		};
		return createProductSetupService(productSetupServiceOptions);
	}

	execute(event){
		return this.preamble(event)
			.then(() => this.acquireInfoRequestProperties())
		//Note: filtering or validation here?
			.then(() => this.respond());

	}

	acquireInfoRequestProperties(){
		let promises = [];

		promises.push(this.acquireProducts());
		promises.push(this.acquireProductSchedules());

		return Promise.all(promises).then(() => {
			return true;
		});

	}

	async acquireProducts(){
		let event = this.parameters.get('event');

		if(!_.has(event, 'products') || !arrayutilities.nonEmpty(event.products)){ return null; }

		const products = await getProductSetupService().getProductsByIds(event.products);
		return this.parameters.set('products', products);

	}

	acquireProductSchedules(){
		let event = this.parameters.get('event');

		if(!_.has(event, 'productschedules') || !arrayutilities.nonEmpty(event.productschedules)){ return null; }

		const ProductScheduleHelper = global.SixCRM.routes.include('helpers','entities/productschedule/ProductSchedule.js');
		let productScheduleHelper = new ProductScheduleHelper();

		return this.productScheduleController.getListByAccount({ids: event.productschedules}).then(product_schedules_result => {

			let hydrated_product_schedules_promises = arrayutilities.map(product_schedules_result.productschedules, product_schedule => {

				return this.productScheduleController.getProducts(product_schedule).then(products_result => {
					du.info(products_result);
					return productScheduleHelper.marryProductsToSchedule({product_schedule: product_schedule, products: products_result.products});
				});
			});

			return Promise.all(hydrated_product_schedules_promises).then(hydrated_product_schedules_promises => {

				return this.parameters.set('productschedules', hydrated_product_schedules_promises);

			})

		});

	}

	respond(){
		let response_object = {};

		let event = this.parameters.get('event');

		if(_.has(event, 'products')){

			let products = this.parameters.get('products', {fatal: false});

			response_object.products = products;

		}

		if(_.has(event, 'productschedules')){

			let product_schedules = this.parameters.get('productschedules', {fatal: false});

			response_object.productschedules = product_schedules;

		}

		return response_object;

	}

}

