const _ = require('lodash');
const querystring = require('querystring');

const du = global.SixCRM.routes.include('lib', 'debug-utilities');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const HttpProvider = global.SixCRM.routes.include('controllers', 'providers/http-provider.js');
const httpprovider = new HttpProvider();
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');


module.exports = class MerchantProvider {

	constructor() {

		this.parameter_validation = {
			'merchantprovider': global.SixCRM.routes.path('model', 'entities/merchantprovider.json')
		};

		this.parameter_definition = {
			construct: {
				required: {
					merchantprovider: 'merchant_provider'
				},
				optional: {

				}
			}
		};

		this.parameters = new Parameters({
			definition: this.parameter_definition,
			validation: this.parameter_validation
		});

		this.parameters.setParameters({
			argumentation: arguments[0],
			action: 'construct'
		});

	}

	augmentParameters() {

		du.debug('Augment Parameters');

		this.parameters.setParameterValidation({
			parameter_validation: this.parameter_validation
		});
		this.parameters.setParameterDefinition({
			parameter_definition: this.parameter_definition
		});

		return true;

	}

	setMerchantProviderParameters({
		return_parameters
	}) {

		du.debug('Set Merchant Provider Parameters');

		let merchant_provider_configuration = this.get('MerchantProviderParameters');

		return_parameters = objectutilities.transcribe(this.merchant_provider_parameters.required, merchant_provider_configuration, return_parameters, true);

		return objectutilities.transcribe(this.merchant_provider_parameters.optional, merchant_provider_configuration, return_parameters);

	}

	setVendorParameters({
		return_parameters
	}) {

		du.debug('Set Vendor Parameters');

		let vendor_configuration = this.get('VendorConfiguration');

		return objectutilities.transcribe(this.vendor_parameters.required, vendor_configuration, return_parameters, true);

	}

	setMethodParameters({
		return_parameters,
		method_parameters
	}) {

		du.debug('Set Method Parameters');

		return objectutilities.transcribe(this.method_parameters.required, method_parameters, return_parameters, true);

	}

	postToProcessor({
		action,
		method_parameters,
		request_parameters
	}) {

		du.debug('Post To Processor');

		return new Promise((resolve, reject) => {

			let parameters = this.createParameterObject();

			let endpoint = this.createEndpoint(method_parameters);

			parameters = this.setMethodParameters({
				method_parameters: method_parameters,
				return_parameters: parameters
			});

			parameters = this.setRequestParameters({
				type: action,
				request_parameters: request_parameters,
				return_parameters: parameters
			});

			this.validateRequestParameters(action, parameters);

			let parameter_querystring = querystring.stringify(parameters);

			var request_options = {
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				url: endpoint,
				body: parameter_querystring
			};

			return httpprovider.post(request_options).then(response => {

				if (_.isError(response.error)) {
					reject(response.error);
				}

				return resolve({
					response: response.response,
					body: response.body
				});

			});

		});

	}

	createEndpoint(method_parameters) {

		du.debug('Create Endpoint');

		let base = this.get('VendorConfiguration').endpoint;

		if (_.has(method_parameters, 'path')) {
			base += method_parameters.path;
		}

		return base;

	}

	createParameterObject() {

		du.debug('Create Parameter Object');

		let return_parameters = this.setVendorParameters({
			return_parameters: {}
		});

		return_parameters = this.setMerchantProviderParameters({
			return_parameters: return_parameters
		});

		return return_parameters;

	}

	setRequestParameters({
		type,
		request_parameters,
		return_parameters
	}) {

		du.debug('Set Request Parameters');

		objectutilities.hasRecursive(this.transaction_parameters, type + '.required', true);

		return_parameters = objectutilities.transcribe(this.transaction_parameters[type].required, request_parameters, return_parameters, true);

		if (objectutilities.hasRecursive(this.transaction_parameters, type + '.optional')) {
			return_parameters = objectutilities.transcribe(this.transaction_parameters[type].optional, request_parameters, return_parameters, false);
		}

		return return_parameters;

	}

	configure(merchant_provider) {

		du.debug('Configure');

		this.setMerchantProviderName();

		this.setVendorConfiguration();

		this.setMerchantProviderParametersObject(merchant_provider);

	}

	validateRequestParameters(request, parameters_object) {

		du.debug('Validate Parameters');

		mvu.validateModel(parameters_object, this.getRequestParametersValidationModelPath(request));

	}

	setVendorConfigurationPath() {

		du.debug('Set Vendor Configuration Path');

		this.set('VendorConfigurationPath', global.SixCRM.configuration.stage + '/vendors/merchantproviders/' + this.get('MerchantProviderName') + '.yml');

	}

	setVendorConfiguration() {

		du.debug('Set Vendor Configuration');

		this.setVendorConfigurationPath();

		if (this.has('VendorConfigurationPath')) {

			let vendor_configuration = global.SixCRM.routes.include('config', this.get('VendorConfigurationPath'));

			if (!_.isNull(vendor_configuration) && !_.isUndefined(vendor_configuration)) {

				this.set('VendorConfiguration', global.SixCRM.routes.include('config', this.get('VendorConfigurationPath')));

				mvu.validateModel(this.get('VendorConfiguration'), this.getVendorConfigurationValidationModelPath());

			}

		}

	}

	setMerchantProviderParametersObject(merchant_provider) {

		du.debug('Set Merchant Provider Parameters');

		this.set('MerchantProviderParameters', merchant_provider);

		mvu.validateModel(this.get('MerchantProviderParameters'), this.getMerchantProviderConfigurationValidationModelPath());

	}

	setMerchantProviderName() {

		du.debug('Set Merchant Provider Name');

		this.set('MerchantProviderName', objectutilities.getClassName(this).replace('Controller', ''));

	}

	getVendorConfigurationValidationModel() {

		du.debug('Get Vendor Configuration Validation Model');

		return require(this.getVendorConfigurationValidationModelPath());

	}

	getMerchantProviderConfigurationValidationModel() {

		du.debug('Get Vendor Configuration Validation Model');

		return require(this.getMerchantProviderConfigurationValidationModelPath());

	}

	getVendorConfigurationValidationModelPath() {

		du.debug('Get Vendor Configuration Validation Model Path');

		return global.SixCRM.routes.path('model', 'functional/' + this.get('MerchantProviderName') + '/vendor_configuration.json');

	}

	getMerchantProviderConfigurationValidationModelPath() {

		du.debug('Get Merchant Provider Configuration Validation Model Path');

		return global.SixCRM.routes.path('model', 'functional/' + this.get('MerchantProviderName') + '/merchant_provider_configuration.json');

	}

	getRequestParametersValidationModelPath(request) {

		du.debug('Get Request Parameters Validatiaon Model Path');

		return global.SixCRM.routes.path('model', 'functional/' + this.get('MerchantProviderName') + '/' + request + '.json');

	}

	respond({
		additional_parameters
	}) {

		du.debug('Respond');

		let vendor_response = this.parameters.get('vendorresponse');
		let action = this.parameters.get('action');

		const VendorResponseClass = global.SixCRM.routes.include('vendors', 'merchantproviders/' + this.getVendorName() + '/Response.js');

		let response_object = {
			vendor_response: vendor_response,
			action: action
		};

		if (!_.isNull(additional_parameters) && !_.isUndefined(additional_parameters)) {
			response_object['additional_parameters'] = additional_parameters;
		}

		return new VendorResponseClass(response_object);

	}

	has(key) {

		du.debug('Has');

		if (_.has(this, key)) {
			return this[key];
		}
		return null;

	}

	set(key, value) {

		du.debug('Set');

		this[key] = value;

	}

	get(key) {

		du.debug('Get');

		if (_.has(this, key)) {
			return this[key];
		}

		return null;

	}

	/* New Shit */
	setMethod() {

		du.debug('Set Method');

		let action = this.parameters.get('action');
		let method = this.methods[action];

		this.parameters.set('method', method);

		return true;

	}

	createParametersObject() {

		du.debug('Create Parameters Object');

		let parameters_object = objectutilities.merge({}, this.getVendorParameters());

		parameters_object = objectutilities.merge(parameters_object, this.getMerchantProviderParameters());
		parameters_object = objectutilities.merge(parameters_object, this.getMethodParameters());
		parameters_object = objectutilities.merge(parameters_object, this.getRequestParameters());

		this.parameters.set('parametersobject', parameters_object);

		return true;

	}

	getVendorParameters() {

		du.debug('Get Vendor Parameters');

		let vendor_name = this.getVendorName();

		let vendor_parameters = global.SixCRM.routes.include('config', global.SixCRM.configuration.stage + '/vendors/merchantproviders/' + vendor_name + '.yml');

		if (!_.isNull(vendor_parameters) && !_.isUndefined(vendor_parameters)) {
			return vendor_parameters;
		}

		return {};

	}

	getVendorName() {

		du.debug('Get Vendor Name');

		return objectutilities.getClassName(this).replace('Controller', '');

	}

	issueRequest() {

		du.debug('Issue Request');

		let method = this.parameters.get('method');

		if (_.isFunction(this['issue' + method + 'Request'])) {
			return this['issue' + method + 'Request']();
		}

		throw eu.getError('server', 'Missing Isssue Request method: "' + method + '".');

	}

	getMethodParameters() {

		du.debug('Get Method Parameters');

		let method = this.parameters.get('method');

		if (_.isFunction(this['get' + method + 'MethodParameters'])) {
			return this['get' + method + 'MethodParameters']();
		}

		return {};

	}

	getRequestParameters() {

		du.debug('Get Request Parameters');

		let method = this.parameters.get('method');

		if (_.isFunction(this['get' + method + 'RequestParameters'])) {
			return this['get' + method + 'RequestParameters']();
		}

		return {};

	}

	getMerchantProviderParameters() {

		du.debug('Get Merchant Provider Parameters');

		let method = this.parameters.get('method');

		if (_.isFunction(this['get' + method + 'MerchantProviderParameters'])) {
			return this['get' + method + 'MerchantProviderParameters']();
		}

		return {};

	}

}
