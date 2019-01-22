const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const entityController = require('./Entity');

module.exports = class ProductController extends entityController {

	constructor(){

		super('product');

		this.search_fields = ['name'];

	}

	associatedEntitiesCheck({id}){
		let return_array = [];

		let data_acquisition_promises = [
			this.executeAssociatedEntityFunction('ProductScheduleController', 'listByProduct', {product: id}),
			this.executeAssociatedEntityFunction('transactionController', 'listByProductID', {id:id})
		];

		return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

			let product_schedules = data_acquisition_promises[0];
			let transactions = data_acquisition_promises[1];

			if(_.has(product_schedules, 'productschedules') && arrayutilities.nonEmpty(product_schedules.productschedules)){
				arrayutilities.map(product_schedules.productschedules, (product_schedule) => {
					return_array.push(this.createAssociatedEntitiesObject({name:'Product Schedule', object: product_schedule}));
				});
			}

			if(_.has(transactions, 'transactions') && arrayutilities.nonEmpty(transactions.transactions)){
				arrayutilities.map(transactions.transactions, (transaction) => {
					return_array.push(this.createAssociatedEntitiesObject({name:'Transaction', object:transaction}));
				});
			}

			return return_array;

		});

	}

	listByFulfillmentProvider({fulfillment_provider, pagination}){
		let query_parameters = {
			filter_expression: '#f1 = :fulfillmentprovider_id',
			expression_attribute_values: {
				':fulfillmentprovider_id':this.getID(fulfillment_provider)
			},
			expression_attribute_names: {
				'#f1':'fulfillment_provider'
			}
		};

		return this.listByAccount({query_parameters: query_parameters, pagination: pagination});

	}

	getMerchantProviderGroup(product){
		if(!_.has(product, 'merchantprovidergroup')){ return Promise.resolve(null); }

		return this.executeAssociatedEntityFunction('MerchantProviderGroupController', 'get', {id: product.merchantprovidergroup});

	}

	getFulfillmentProvider(product){
		if (!product.fulfillment_provider) {
			return Promise.resolve(null); //fulfillment_provider is optional
		}

		let fulfillment_provider =  this.executeAssociatedEntityFunction('FulfillmentProviderController', 'get', {id: product.fulfillment_provider});

		return fulfillment_provider;

	}

	getProducts(products_array){
		return this.listBy({list_array: products_array});

	}

	getByIds(ids) {

		return this.batchGet({ids});

	}

	getProductSchedules(args){
		if(!_.has(args, 'product')){
			throw eu.getError('bad_request','getProductSchedules requires a product argument.');
		}

		return this.executeAssociatedEntityFunction('ProductScheduleController', 'listByProduct', {product: args.product, pagination: args.pagination});

	}

	validateDynamicPrice(product, price) {
		if (_.has(product, 'dynamic_pricing')) {
			const {min, max} = product.dynamic_pricing;
			return price >= min && price <= max;
		}

		return product.default_price === price;
	}

}

