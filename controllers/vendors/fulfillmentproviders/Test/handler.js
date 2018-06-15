
const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
const httpprovider = new HttpProvider();

const ProductHelperController = global.SixCRM.routes.include('helpers', 'entities/product/Product.js');

const FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider');

module.exports = class TestController extends FulfillmentProviderController {

	constructor(){

		super(arguments[0]);

		this.methods = {
			info: 'getinfo',
			test: 'getinfo',
			fulfill: 'fulfill'
		};

		this.parameter_validation = {
			'vendorresponse':global.SixCRM.routes.path('model','vendors/fulfillmentproviders/Test/vendorresponse.json'),
			'action': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/action.json'),
			'method': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/Test/method.json'),
			//'parametersobject': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/Test/parametersobject.json'),
			'customer':global.SixCRM.routes.path('model','entities/customer.json'),
			//Technical Debt:  Resolve
			//'products':global.SixCRM.routes.path('model','entities/components/products.json')
		};

		this.parameter_definition = {
			fulfill:{
				required:{
					action: 'action',
					customer: 'customer',
					products: 'products'
				},
				optional:{}
			},
			test:{
				required:{
					action:'action'
				},
				optional:{}
			},
			info:{
				required:{
					action:'action',
					shippingreceipt:'shipping_receipt'
				},
				optional:{}
			}
		};

		this.augmentParameters();

	}

	fulfill(){

		du.debug('Fulfill');

		let argumentation = arguments[0];

		argumentation.action = 'fulfill';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'fulfill'}))
			.then(() => this.setReferenceNumber())
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => {

				let reference_number = this.parameters.get('referencenumber');

				return this.respond({additional_parameters: {reference_number: reference_number}});

			});

	}

	info(){

		du.debug('info');

		let argumentation = arguments[0];

		argumentation.action = 'info';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'info'}))
			.then(() => this.setReferenceNumber())
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	test(){

		du.debug('Test');
		let argumentation = {action: 'test'};

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'test'}))
			.then(() => this.setReferenceNumber())
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	setMethod(){

		du.debug('Set Method');

		let action = this.parameters.get('action');

		if(objectutilities.hasRecursive(this, 'methods.'+action)){

			this.parameters.set('method', this.methods[action]);

		}

		return true;

	}

	createParametersObject(){

		du.debug('Create Parameters Object');

		let parameters_object = objectutilities.merge({}, this.getVendorParameters());

		parameters_object = objectutilities.merge(parameters_object, this.getFulfillmentProviderParameters());

		parameters_object = objectutilities.merge(parameters_object, this.getMethodParameters());
		parameters_object = objectutilities.merge(parameters_object, this.getRequestParameters());

		this.parameters.set('parametersobject', parameters_object);

		return true;

	}

	getVendorParameters(){

		du.debug('Get Vendor Parameters');

		let vendor_configuration = global.SixCRM.routes.include('config', global.SixCRM.configuration.stage+'/vendors/fulfillmentproviders/Test.yml');

		this.parameters.set('endpoint', vendor_configuration.endpoint);

		return {};

	}

	getFulfillmentProviderParameters(){

		du.debug('Get Fulfillment Provider Parameters');

		return {};

	}

	getMethodParameters(){

		du.debug('Get Method Parameters');

		let method = this.parameters.get('method');

		if(_.isFunction(this['get'+method+'MethodParameters'])){
			return this['get'+method+'MethodParameters']();
		}

		return {};

	}

	getRequestParameters(){

		du.debug('Get Request Parameters');

		let method = this.parameters.get('method');

		if(_.isFunction(this['get'+method+'RequestParameters'])){
			return this['get'+method+'RequestParameters']();
		}

		return {};

	}

	getgetinfoRequestParameters(){

		du.debug('Get Get Info Request Parameters');

		return {
			reference_number: this.parameters.get('referencenumber')
		};

	}

	getfulfillRequestParameters(){

		du.debug('Get Get Info Request Parameters');

		return {
			customer: this.createCustomerObject(),
			orders: this.createOrdersArray()
		};

	}

	createCustomerObject(){

		du.debug('Create Customer Object');

		let customer = this.parameters.get('customer');

		let customer_object = objectutilities.transcribe(
			{
				firstname:'firstname',
				lastname: 'lastname',
				address: 'address'
			},
			customer,
			{}
		);

		customer_object = objectutilities.transcribe(
			{
				phone: 'phone',
				email: 'email'
			},
			customer,
			customer_object,
			false
		);

		return customer_object;

	}

	createOrdersArray(){

		du.debug('Create Orders Array');

		let products = this.parameters.get('products');

		let productHelperController = new ProductHelperController();
		let skus = productHelperController.getDistributionBySKU({products: products});

		return objectutilities.map(skus, (sku) =>  {
			return{
				sku:sku,
				quantity:skus[sku]
			};
		});

	}

	issueRequest(){

		du.debug('Issue Request');

		let parameters_object = this.parameters.get('parametersobject');
		let uri = this.parameters.get('endpoint')+this.parameters.get('method');

		var request_options = {
			body: parameters_object,
			url: uri
		};

		return httpprovider.postJSON(request_options).then(result => {
			this.parameters.set('vendorresponse', result);
			return result;
		});

	}

}
