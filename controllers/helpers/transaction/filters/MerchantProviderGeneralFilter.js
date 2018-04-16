
const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const Parameters = global.SixCRM.routes.include('providers','Parameters.js');

module.exports = class MerchantProviderGeneralFilter {

	constructor(){

		this.parameter_validation = {
			'creditcard':global.SixCRM.routes.path('model','entities/creditcard.json'),
			'merchantproviders':global.SixCRM.routes.path('model','entities/components/merchantproviders.json'),
			'amount':global.SixCRM.routes.path('model','definitions/currency.json'),
		};

		this.parameter_definition = {
			filter:{
				required:{
					merchantproviders:'merchant_providers',
					creditcard: 'creditcard',
					amount: 'amount'
				},
				optional:{}
			}
		};

		this.brandaliases = {
			'amex':'americanexpress'
		};

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	filter(){

		du.debug('Filter Merchant Providers');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'filter'}))
			.then(() => this.executeFilter());

	}

	executeFilter(){

		du.debug('Execute Filter');

		let merchant_providers = this.parameters.get('merchantproviders');

		return this.filterInvalidMerchantProviders({merchant_providers: merchant_providers})
			.then((result) => this.filterDisabledMerchantProviders({merchant_providers: result}))
			.then((result) => this.filterTypeMismatchedMerchantProviders({merchant_providers: result}))
			.then((result) => this.filterCAPShortageMerchantProviders({merchant_providers: result}))
			.then((result) => this.filterCountShortageMerchantProviders({merchant_providers: result}));

	}

	filterInvalidMerchantProviders({merchant_providers}){

		du.debug('Filter Invalid Merchant Providers');

		if(!arrayutilities.nonEmpty(merchant_providers)){
			throw eu.getError('server', 'No merchant providers to select from.');
		}

		let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

			return (_.has(merchant_provider, 'summary'));

		});

		return Promise.resolve(return_array);

	}

	filterDisabledMerchantProviders({merchant_providers}){

		du.debug('Filter Disabled Merchant Providers');

		if(!arrayutilities.nonEmpty(merchant_providers)){
			throw eu.getError('server', 'No merchant providers to select from.');
		}

		let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {
			return (merchant_provider.enabled == true);
		});

		return Promise.resolve(return_array);

	}

	filterTypeMismatchedMerchantProviders({merchant_providers}){

		du.debug('Filter Type Mismatched Merchant Providers');

		let creditcard = this.parameters.get('creditcard');

		if(!arrayutilities.nonEmpty(merchant_providers)){
			throw eu.getError('server', 'No merchant providers to select from.');
		}

		let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

			let accepted_payment_methods_array = arrayutilities.map(merchant_provider.accepted_payment_methods, (accepted_payment_method) => {
				return this.makeGeneralBrandString(accepted_payment_method);
			});

			return _.includes(accepted_payment_methods_array, this.makeGeneralBrandString(creditcard.properties.brand));

		});

		return Promise.resolve(return_array);

	}

	filterCAPShortageMerchantProviders({merchant_providers}){

		du.debug('Filter CAP Shortage Merchant Providers');

		let amount = this.parameters.get('amount');

		if(!arrayutilities.nonEmpty(merchant_providers)){
			throw eu.getError('server', 'No merchant providers to select from.');
		}

		merchant_providers = arrayutilities.filter(merchant_providers, (merchant_provider) => {

			if(objectutilities.hasRecursive(merchant_provider, 'processing.monthly_cap') && !_.isNull(merchant_provider.processing.monthly_cap)){

				//Technical Debt:  Lets abstract this to a different function
				let proposed_total = (parseFloat(merchant_provider.summary.summary.thismonth.amount) + parseFloat(amount));
				let cap = parseFloat(merchant_provider.processing.monthly_cap);

				if((proposed_total >= cap)){
					du.warning('CAP Shortage')
					return false;
				}

			}

			return true;

		});


		return Promise.resolve(merchant_providers);

	}

	filterCountShortageMerchantProviders({merchant_providers}){

		du.debug('Filter Count Shortage Merchant Providers');

		if(!arrayutilities.nonEmpty(merchant_providers)){
			throw eu.getError('server', 'No merchant providers to select from.');
		}

		let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

			let return_value = true;

			if(objectutilities.hasRecursive(merchant_provider, 'processing.transaction_counts.daily') && !_.isNull(merchant_provider.processing.transaction_counts.daily)){

				if(parseInt(merchant_provider.summary.summary.today.count) >= parseInt(merchant_provider.processing.transaction_counts.daily)){
					du.warning('Daily Count Shortage');
					return_value = false;
				}

			}

			if(objectutilities.hasRecursive(merchant_provider, 'processing.transaction_counts.weekly') && !_.isNull(merchant_provider.processing.transaction_counts.weekly)){

				if(parseInt(merchant_provider.summary.summary.thisweek.count) >= parseInt(merchant_provider.processing.transaction_counts.weekly)){
					du.warning('Weekly Count Shortage');
					return_value = false;
				}

			}

			if(objectutilities.hasRecursive(merchant_provider, 'processing.transaction_counts.monthly') && !_.isNull(merchant_provider.processing.transaction_counts.monthly)){

				if(parseInt(merchant_provider.summary.summary.thismonth.count) >= parseInt(merchant_provider.processing.transaction_counts.monthly)){
					du.warning('Monthly Count Shortage');
					return_value = false;
				}

			}

			if(return_value == false){
				du.info(merchant_provider);
			}

			return return_value;

		});

		return Promise.resolve(return_array);

	}

	makeGeneralBrandString(a_string){

		du.debug('Make General Brand String');

		stringutilities.isString(a_string, true);

		let transformed_string = stringutilities.removeWhitespace(a_string).toLowerCase();

		if(_.has(this.brandaliases, transformed_string)){
			transformed_string = this.brandaliases[transformed_string];
		}

		return transformed_string;

	}

}

