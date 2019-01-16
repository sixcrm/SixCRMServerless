
const _ = require('lodash');

const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const hashutilities = require('@6crm/sixcrmcore/util/hash-utilities').default;
const HttpProvider = require('@6crm/sixcrmcore/providers/http-provider').default;
const httpprovider = new HttpProvider();
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

const FulfillmentProviderController = global.SixCRM.routes.include('vendors', 'fulfillmentproviders/FulfillmentProvider.js');

module.exports = class ShipStationController extends FulfillmentProviderController {

	constructor(){

		super(arguments[0]);

		this.methods = {
			fulfill: 'CreateOrder',
			test: 'ListFulfillments',
			info: 'ListFulfillments'
		};

		this.parameter_validation = {
			'vendorresponse':global.SixCRM.routes.path('model','vendors/fulfillmentproviders/ShipStation/vendorresponse.json'),
			'action': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/ShipStation/action.json'),
			'method': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/ShipStation/method.json'),
			'parametersobject': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/ShipStation/parametersobject.json'),
			'customer':global.SixCRM.routes.path('model','entities/customer.json'),
			'products':global.SixCRM.routes.path('model', 'entities/components/products.json'),
			'shippingreceipt':global.SixCRM.routes.path('model','entities/shippingreceipt.json'),
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
					action: 'action'
				},
				optional:{}
			},
			info:{
				required:{
					action: 'action',
					shippingreceipt:'shipping_receipt'
				},
				optional:{}
			}
		};

		this.augmentParameters();

	}

	test(){
		let argumentation = {
			action: 'test'
		};

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'test'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	info(){
		let argumentation = arguments[0];

		argumentation.action = 'info';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'info'}))
			.then(() => this.setMethod())
			.then(() => this.setReferenceNumber())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	fulfill(){
		let argumentation = arguments[0];

		argumentation.action = 'fulfill';

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'fulfill'}))
			.then(() => this.setMethod())
			.then(() => this.setReferenceNumber())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => {
				let reference_number = this.parameters.get('referencenumber');

				return this.respond({additional_parameters: {reference_number: reference_number}});
			});

	}

	setMethod(){
		let action = this.parameters.get('action');
		let method = this.methods[action];

		this.parameters.set('method', method);

		return true;

	}

	createParametersObject(){
		let parameters_object = objectutilities.merge({}, this.getVendorParameters());

		parameters_object = objectutilities.merge(parameters_object, this.getFulfillmentProviderParameters());

		parameters_object = objectutilities.merge(parameters_object, this.getMethodParameters());
		parameters_object = objectutilities.merge(parameters_object, this.getRequestParameters());

		this.parameters.set('parametersobject', parameters_object);

		return true;

	}

	issueRequest(){
		let method = this.parameters.get('method');

		if(_.isFunction(this['issue'+method+'Request'])){
			return this['issue'+method+'Request']();
		}

		throw eu.getError('server', 'Missing Isssue Request method: "'+method+'".');

	}

	getVendorParameters(){
		let vendor_parameters = global.SixCRM.routes.include('config', global.SixCRM.configuration.stage+'/vendors/fulfillmentproviders/ShipStation.yml');

		return objectutilities.transcribe(
			{
				endpoint: 'endpoint'
			},
			vendor_parameters,
			{}
		);

	}

	getFulfillmentProviderParameters(){
		return {};

	}

	getMethodParameters(){
		let method = this.parameters.get('method');

		if(_.isFunction(this['get'+method+'MethodParameters'])){
			return this['get'+method+'MethodParameters']();
		}

		return {};

	}

	getListFulfillmentsMethodParameters(){
		return {
			path: 'fulfillments'
		};

	}

	getCreateOrderMethodParameters(){
		return {
			path: 'orders/createorder'
		};

	}

	getRequestParameters(){
		let method = this.parameters.get('method');

		if(_.isFunction(this['get'+method+'RequestParameters'])){
			return this['get'+method+'RequestParameters']();
		}

		return {};

	}

	getListFulfillmentsRequestParameters(){
		let {store_id} = this.parameters.get('fulfillmentprovider').provider;
		let reference_number = this.parameters.get('referencenumber', {fatal: false});

		let request_parameters = {
			page: 1,
			pageSize: 1
		};

		if(!_.isNull(reference_number)){
			request_parameters.orderNumber = reference_number;
		}

		if (!_.isUndefined(store_id)) {
			request_parameters.storeId = store_id;
		}

		return request_parameters;

	}

	getCreateOrderRequestParameters(){
		let {store_id} = this.parameters.get('fulfillmentprovider').provider;
		let customer = this.parameters.get('customer');
		let products = this.parameters.get('products');

		let order_identifier = this.parameters.get('referencenumber');

		let parameters = {
			orderNumber: order_identifier,
			orderKey: order_identifier,
			orderDate: timestamp.convertToFormat(timestamp.getISO8601(), 'YYYY-MM-DDTHH:MM:ss.SSSSS'),
			orderStatus: 'awaiting_shipment',
			customerEmail: customer.email,
			customerUsername: customer.email,
			billTo: this.createBillTo(customer),
			shipTo: this.createShipTo(customer),
			items: this.createItems(products)
		}

		if (!_.isUndefined(store_id)) {
			parameters.advancedOptions = {
				storeId: store_id
			};
		}

		return parameters;

	}

	createFullName(object){

		return object.firstname+' '+object.lastname;

	}

	createBillTo(customer){

		customer.fullname = this.createFullName(customer);

		let parameters = objectutilities.transcribe(
			{
				name: 'fullname',
				street1: 'address.line1',
				city: 'address.city',
				state: 'address.state',
				postalCode:'address.zip',
				country: 'address.country'
			},
			customer,
			{}
		);

		parameters = objectutilities.transcribe(
			{
				street2: 'address.line2',
				phone: 'phone',
				email: 'email'
			},
			customer,
			parameters,
			false
		);

		let addnulls = ['company', 'street2','street3', 'phone'];

		arrayutilities.map(addnulls, (addnull_field) => {
			if(!_.has(parameters, addnull_field)){
				parameters[addnull_field] = null;
			}
		});

		return parameters;

	}

	createShipTo(customer){

		customer.fullname = this.createFullName(customer);

		let parameters = objectutilities.transcribe(
			{
				name: 'fullname',
				street1: 'address.line1',
				city: 'address.city',
				state: 'address.state',
				postalCode: 'address.zip',
				country: 'address.country'
			},
			customer,
			{}
		);

		parameters = objectutilities.transcribe(
			{
				street2: 'address.line2',
				phone: 'phone',
				email: 'email'
			},
			customer,
			parameters,
			false
		);

		let addnulls = ['company', 'street2','street3', 'phone'];

		arrayutilities.map(addnulls, (addnull_field) => {
			if(!_.has(parameters, addnull_field)){
				parameters[addnull_field] = null;
			}
		});

		return parameters;

	}

	createItems(products){

		let grouped_products = arrayutilities.group(products, product => product.sku);

		return objectutilities.map(grouped_products, product_sku => {
			let product = grouped_products[product_sku][0];
			let quantity = grouped_products[product_sku].length;

			return {
				"sku": product.sku,
				"name": product.name,
				"quantity": quantity,
				"fulfillmentSku": null,
			}
		});

	}

	issueCreateOrderRequest(){
		let parameters = this.parameters.get('parametersobject');

		let url = parameters.endpoint+parameters.path;

		delete parameters.endpoint;
		delete parameters.path;

		let options = {
			url: url,
			headers: {
				'Authorization': this.createAuthorizationString(),
			},
			body: parameters
		};

		return httpprovider.postJSON(options).then(result => {

			this.parameters.set('vendorresponse', result);

			return true;

		});

	}


	issueListFulfillmentsRequest(){
		let parameters = this.parameters.get('parametersobject');

		let url = parameters.endpoint+parameters.path;

		delete parameters.endpoint;
		delete parameters.path;

		let options = {
			url: url,
			headers: {
				'Authorization': this.createAuthorizationString(),
			},
			querystring: parameters
		};

		return httpprovider.getJSON(options).then(result => {

			this.parameters.set('vendorresponse', result);

			return true;

		});

	}

	createAuthorizationString(){
		let api_key = this.parameters.get('fulfillmentprovider').provider.api_key;
		let api_secret = this.parameters.get('fulfillmentprovider').provider.api_secret;

		return 'Basic '+hashutilities.toBase64(api_key+':'+api_secret);

	}

}
