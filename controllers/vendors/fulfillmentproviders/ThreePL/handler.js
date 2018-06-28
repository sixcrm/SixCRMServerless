
const _ = require('lodash');

//Technical Debt:  need a "XML-Helper" class
const js2xmlparser = require("js2xmlparser2");

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
const httpprovider = new HttpProvider();

const ProductHelperController = global.SixCRM.routes.include('helpers', 'entities/product/Product.js');

const FulfillmentProviderController = global.SixCRM.routes.include('controllers', 'vendors/fulfillmentproviders/FulfillmentProvider');

module.exports = class ThreePLController extends FulfillmentProviderController {

	constructor(){

		super(arguments[0]);

		this.methods = {
			fulfill: 'CreateOrders',
			test: 'FindOrders',
			info: 'FindOrders'
		};

		this.parameter_validation = {
			'vendorresponse':global.SixCRM.routes.path('model','vendors/fulfillmentproviders/ThreePL/vendorresponse.json'),
			'action': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/ThreePL/action.json'),
			'method': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/ThreePL/method.json'),
			'soapaction': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/ThreePL/soapaction.json'),
			'wsdl': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/ThreePL/wsdl.json'),
			//'parametersobject': global.SixCRM.routes.path('model', 'vendors/fulfillmentproviders/ThreePL/parametersobject.json'),
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
			.then(() => this.setMethod())
			.then(() => this.setReferenceNumber())
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
			.then(() => this.setMethod())
			.then(() => this.setReferenceNumber())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	test(){

		du.debug('Test');
		let argumentation = {action: 'test'};

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: argumentation, action: 'test'}))
			.then(() => this.setMethod())
			.then(() => this.createParametersObject())
			.then(() => this.issueRequest())
			.then(() => this.respond({}));

	}

	setMethod(){

		du.debug('Set Method');

		let action = this.parameters.get('action');
		let method = this.methods[action];

		this.parameters.set('method', method);

		return true;

	}

	createParametersObject(){

		du.debug('Create Parameters Object');

		let parameters_object = objectutilities.merge({}, this.getVendorParameters());

		parameters_object = objectutilities.merge(parameters_object, this.getFulfillmentProviderParameters());

		parameters_object = objectutilities.merge(parameters_object, this.getMethodParameters());
		parameters_object = objectutilities.merge(parameters_object, this.getRequestParameters());

		du.warning(parameters_object);  //process.exit();

		this.parameters.set('parametersobject', parameters_object);

		return true;

	}

	getVendorParameters(){

		du.debug('Get Vendor Parameters');

		//Technical Debt:  Do these need to come from configuration files?
		this.parameters.set('wsdl', 'https://secure-wms.com/webserviceexternal/contracts.asmx?wsdl');

		return {};

	}

	getFulfillmentProviderParameters(){

		du.debug('Get Fulfillment Provider Parameters');

		let method = this.parameters.get('method');

		if(_.isFunction(this['get'+method+'FulfillmentProviderParameters'])){
			return this['get'+method+'FulfillmentProviderParameters']();
		}

		return {};

	}

	getCreateOrdersFulfillmentProviderParameters(){

		du.debug('Get CreateOrders Fulfillment Provider Parameters');

		let fulfillment_provider = this.parameters.get('fulfillmentprovider');

		let login_data = objectutilities.transcribe({
			ThreePLKey: 'provider.threepl_key',
			Login: 'provider.username',
			Password: 'provider.password'
		},
		fulfillment_provider,
		{},
		true
		);

		login_data["@"] = { xmlns: 'http://www.JOI.com/schemas/ViaSub.WMS/' };
		login_data.FacilityID = this.getFacilityID();

		login_data = {
			extLoginData: login_data
		};

		return login_data;

	}

	getFacilityID(){

		du.debug('Get Facility ID');

		if(_.has(this, 'ThreePLFacilityID')){
			return this.ThreePLFacilityID;
		}

		let fulfillment_provider = this.parameters.get('fulfillmentprovider', 'provider.threepl_facility_id', {fatal: false});

		if(!_.isNull(fulfillment_provider)){
			return fulfillment_provider.provider.threepl_facility_id;
		}

		throw eu.getError('server', 'Unable to establish ThreePL Facility ID.');

	}

	getFindOrdersFulfillmentProviderParameters(){

		du.debug('Get CreateOrders Fulfillment Provider Parameters');

		let fulfillment_provider = this.parameters.get('fulfillmentprovider');

		let user_login_data = objectutilities.transcribe({
			Login: 'provider.username',
			Password: 'provider.password',
		},
		fulfillment_provider,
		{},
		true
		);

		user_login_data["@"] = { xmlns: 'http://www.JOI.com/schemas/ViaSub.WMS/' };
		user_login_data.ThreePLID = this.getThreePLID();

		user_login_data = {
			userLoginData: user_login_data
		};

		return user_login_data;

	}

	getThreePLID(){

		du.debug('Get ThreePL ID');

		if(_.has(this, 'ThreePLID')){
			return this.ThreePLID;
		}

		let fulfillment_provider = this.parameters.get('fulfillmentprovider', {fatal: false});

		if(!_.isNull(fulfillment_provider)){
			return fulfillment_provider.provider.threepl_id;
		}

		throw eu.getError('Unknown ThreePL ID');

	}

	getMethodParameters(){

		du.debug('Get Method Parameters');

		let method = this.parameters.get('method');

		this.parameters.set('soapaction', 'http://www.JOI.com/schemas/ViaSub.WMS/'+method);

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

	getFindOrdersRequestParameters(){

		du.debug('Get FindOrders Request Parameters');

		let fulfillment_provider = this.parameters.get('fulfillmentprovider');
		let reference_number = this.parameters.get('referencenumber', {fatal: false});

		let request_parameters = {
			focr: {
				'@':{
					xmlns: 'http://www.JOI.com/schemas/ViaSub.WMS/',
				},
				CustomerID: fulfillment_provider.provider.threepl_customer_id,
				FacilityID: this.getFacilityID(),
				OverAlloc: 'Any',
				Closed: 'Any',
				ASNSent: 'Any',
				RouteSent: 'Any',
				//ReferenceNum: '50fee3d6-3bc6-422f-95f3-101f64b5e60d' //this works...
				//BeginDate: '2013-07-17',
				//EndDate: '2013-07-18',
				//DateRangeType: 'Confirm'
			},
			limitCount: {
				'@':{
					xmlns: 'http://www.JOI.com/schemas/ViaSub.WMS/'
				},
				'#':1
			}
		};

		if(!_.isNull(reference_number)){
			request_parameters.focr.ReferenceNum = reference_number;
		}

		return request_parameters;

	}

	getCreateOrdersRequestParameters(){

		du.debug('Get Create Orders Method Parameters');

		let reference_number = this.parameters.get('referencenumber');

		let request_parameters = {
			orders: {
				'@':{
					xmlns: 'http://www.JOI.com/schemas/ViaSub.WMS/',
				},
				Order: {
					TransInfo:{
						ReferenceNum: reference_number
					},
					ShipTo: this.getCustomerParameters(),
					ShippingInstructions: {
						Carrier:'USPS',
						Mode: 'First Class Mail',
						BillingCode: 'Prepaid'
						//Technical Debt:  What is this?!
						//Account: 12345675
					},
					Notes: 'none',
					OrderLineItems: this.getProductParameters()
				}
			},
			warnings: {
				'@':{
					xmlns: 'http://www.JOI.com/schemas/ViaSub.WMS/'
				},
				'#':'none'
			}
		};

		return request_parameters;

	}

	getCustomerParameters(){

		du.debug('Get Customer Parameters');

		let customer = this.parameters.get('customer');

		let address = this.getCustomerAddress();

		let parameters = {
			Name: customer.firstname+' '+customer.lastname,
			CompanyName: customer.firstname+' '+customer.lastname,
			Address: address
		};

		parameters = objectutilities.transcribe(
			{
				PhoneNumber1:'phone',
				EmailAddress1: 'email'
			},
			customer,
			parameters
		);

		return parameters;

	}

	getCustomerAddress(){

		let customer = this.parameters.get('customer');

		let address = objectutilities.transcribe(
			{
				Address1:'address.line1',
				City: 'address.city',
				State: 'address.state',
				Zip: 'address.zip',
				Country: 'address.country'
			},
			customer,
			{},
			true
		);

		return objectutilities.transcribe(
			{
				Address2: 'address.line2',
			},
			customer,
			address
		);

	}

	getProductParameters(){

		du.debug('Get Product Parameters');

		let productHelperController = new ProductHelperController();

		let products = this.parameters.get('products');

		let skus = productHelperController.getDistributionBySKU({products: products});

		return objectutilities.map(skus, (sku) =>  {
			return{
				SKU:sku,
				Qty:skus[sku]
			};
		});

	}

	packageSoapXMLParameters(){

		let parameters_object = this.parameters.get('parametersobject');

		let root_parameters = {
			'@':{
				'xmlns:xsi':'http://www.w3.org/2001/XMLSchema-instance',
				'xmlns:xsd':'http://www.w3.org/2001/XMLSchema',
				'xmlns:soap':'http://schemas.xmlsoap.org/soap/envelope/'
			},
			'soap:Body':parameters_object
		};

		let options =  {
			prettyPrinting:{
				enabled: false
			},
			wrapArray: {
				enabled: true,
				elementName: 'OrderLineItem'
			}
		};

		return js2xmlparser('soap:Envelope', root_parameters, options);

	}

	issueRequest(){

		du.debug('Issue Request');

		let soap_parameters = this.packageSoapXMLParameters();
		let soap_action = this.parameters.get('soapaction');

		var options = {
			url: 'http://secure-wms.com/webserviceexternal/contracts.asmx',
			headers: {
				'Content-Type': 'text/xml; charset=utf-8',
				'Content-Length': soap_parameters.length.toString(),
				'SOAPAction': soap_action ,
				'Host': 'secure-wms.com',
				'Connection': 'keep-alive'
			},
			method: 'post',
			body: soap_parameters
		};

		return httpprovider.post(options).then((result) => {

			this.parameters.set('vendorresponse', result);

			return true;

		});

	}

}
