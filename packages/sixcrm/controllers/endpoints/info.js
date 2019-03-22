
const _ = require('lodash');

const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const { getProductSetupService, getProductScheduleService, LegacyProduct } = require('@6crm/sixcrm-product-setup');

const transactionEndpointController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

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

		this.initialize();

	}

	async execute(event, context) {
		await this.preamble(event, context)
		await this.acquireInfoRequestProperties();
		//Note: filtering or validation here?
		return this.respond();

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

		const products = (await getProductSetupService().getProductsByIds(
			event.products
		)).map(product => LegacyProduct.hybridFromProduct(product));
		return this.parameters.set('products', products);

	}

	async acquireProductSchedules(){
		let event = this.parameters.get('event');

		if(!_.has(event, 'productschedules') || !arrayutilities.nonEmpty(event.productschedules)){ return null; }

		const productSchedules = await getProductScheduleService().getByIds(event.productschedules);
		return this.parameters.set('productschedules', productSchedules);
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

