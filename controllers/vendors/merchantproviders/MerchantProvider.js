const _ = require('lodash');
const querystring = require('querystring');

const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const HttpProvider = require('@6crm/sixcrmcore/providers/http-provider').default;
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

		this.parameters.store = {};

		this.parameters.setParameters({
			argumentation: arguments[0],
			action: 'construct'
		});

	}

	augmentParameters() {
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
		let merchant_provider_configuration = this.get('MerchantProviderParameters');

		return_parameters = objectutilities.transcribe(this.merchant_provider_parameters.required, merchant_provider_configuration, return_parameters, true);

		return objectutilities.transcribe(this.merchant_provider_parameters.optional, merchant_provider_configuration, return_parameters);

	}

	setVendorParameters({
		return_parameters
	}) {
		let vendor_configuration = this.get('VendorConfiguration');

		return objectutilities.transcribe(this.vendor_parameters.required, vendor_configuration, return_parameters, true);

	}

	setMethodParameters({
		return_parameters,
		method_parameters
	}) {
		return objectutilities.transcribe(this.method_parameters.required, method_parameters, return_parameters, true);

	}

	postToProcessor({
		action,
		method_parameters,
		request_parameters
	}) {
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
		let base = this.get('VendorConfiguration').endpoint;

		if (_.has(method_parameters, 'path')) {
			base += method_parameters.path;
		}

		return base;

	}

	createParameterObject() {
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
		objectutilities.hasRecursive(this.transaction_parameters, type + '.required', true);

		return_parameters = objectutilities.transcribe(this.transaction_parameters[type].required, request_parameters, return_parameters, true);

		if (objectutilities.hasRecursive(this.transaction_parameters, type + '.optional')) {
			return_parameters = objectutilities.transcribe(this.transaction_parameters[type].optional, request_parameters, return_parameters, false);
		}

		return return_parameters;

	}

	configure(merchant_provider) {
		this.setMerchantProviderName();

		this.setVendorConfiguration();

		this.setMerchantProviderParametersObject(merchant_provider);

	}

	validateRequestParameters(request, parameters_object) {
		global.SixCRM.validate(parameters_object, this.getRequestParametersValidationModelPath(request));

	}

	setVendorConfigurationPath() {
		this.set('VendorConfigurationPath', global.SixCRM.configuration.stage + '/vendors/merchantproviders/' + this.get('MerchantProviderName') + '.yml');

	}

	setVendorConfiguration() {
		this.setVendorConfigurationPath();

		if (this.has('VendorConfigurationPath')) {

			let vendor_configuration = global.SixCRM.routes.include('config', this.get('VendorConfigurationPath'));

			if (!_.isNull(vendor_configuration) && !_.isUndefined(vendor_configuration)) {

				this.set('VendorConfiguration', global.SixCRM.routes.include('config', this.get('VendorConfigurationPath')));

				global.SixCRM.validate(this.get('VendorConfiguration'), this.getVendorConfigurationValidationModelPath());

			}

		}

	}

	setMerchantProviderParametersObject(merchant_provider) {
		this.set('MerchantProviderParameters', merchant_provider);

		global.SixCRM.validate(this.get('MerchantProviderParameters'), this.getMerchantProviderConfigurationValidationModelPath());

	}

	setMerchantProviderName() {
		this.set('MerchantProviderName', objectutilities.getClassName(this).replace('Controller', ''));

	}

	getVendorConfigurationValidationModel() {
		return require(this.getVendorConfigurationValidationModelPath());

	}

	getMerchantProviderConfigurationValidationModel() {
		return require(this.getMerchantProviderConfigurationValidationModelPath());

	}

	getVendorConfigurationValidationModelPath() {
		return global.SixCRM.routes.path('model', 'functional/' + this.get('MerchantProviderName') + '/vendor_configuration.json');

	}

	getMerchantProviderConfigurationValidationModelPath() {
		return global.SixCRM.routes.path('model', 'functional/' + this.get('MerchantProviderName') + '/merchant_provider_configuration.json');

	}

	getRequestParametersValidationModelPath(request) {
		return global.SixCRM.routes.path('model', 'functional/' + this.get('MerchantProviderName') + '/' + request + '.json');

	}

	respond({
		additional_parameters
	}) {
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
		if (_.has(this, key)) {
			return this[key];
		}
		return null;

	}

	set(key, value) {
		this[key] = value;

	}

	get(key) {
		if (_.has(this, key)) {
			return this[key];
		}

		return null;

	}

	/* New Shit */
	setMethod(method) {
		if(_.isUndefined(method) || _.isNull(method)){
			let action = this.parameters.get('action');
			method = this.methods[action];
		}

		this.parameters.set('method', method);

		return true;

	}

	createParametersObject() {
		let parameters_object = objectutilities.merge({}, this.getVendorParameters());

		parameters_object = objectutilities.merge(parameters_object, this.getMerchantProviderParameters());
		parameters_object = objectutilities.merge(parameters_object, this.getMethodParameters());
		parameters_object = objectutilities.merge(parameters_object, this.getRequestParameters());

		this.parameters.set('parametersobject', parameters_object);
		return parameters_object;

	}

	getVendorParameters() {
		let vendor_name = this.getVendorName();

		let vendor_parameters = global.SixCRM.routes.include('config', global.SixCRM.configuration.stage + '/vendors/merchantproviders/' + vendor_name + '.yml');

		if (!_.isNull(vendor_parameters) && !_.isUndefined(vendor_parameters)) {
			return vendor_parameters;
		}

		return {};

	}

	getVendorName() {
		return objectutilities.getClassName(this).replace('Controller', '');

	}

	issueRequest() {
		let method = this.parameters.get('method');

		if (_.isFunction(this['issue' + method + 'Request'])) {
			return this['issue' + method + 'Request']();
		}

		throw eu.getError('server', 'Missing Isssue Request method: "' + method + '".');

	}

	getMethodParameters() {
		let method = this.parameters.get('method');

		if (_.isFunction(this['get' + method + 'MethodParameters'])) {
			return this['get' + method + 'MethodParameters']();
		}

		return {};

	}

	getRequestParameters() {
		let method = this.parameters.get('method');

		if (_.isFunction(this['get' + method + 'RequestParameters'])) {
			return this['get' + method + 'RequestParameters']();
		}

		return {};

	}

	getMerchantProviderParameters() {
		let method = this.parameters.get('method');

		if (_.isFunction(this['get' + method + 'MerchantProviderParameters'])) {
			return this['get' + method + 'MerchantProviderParameters']();
		}

		return {};

	}

}
