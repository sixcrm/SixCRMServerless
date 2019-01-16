
const _ = require('lodash');
const creditCardType = require('credit-card-type');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const Parameters = global.SixCRM.routes.include('providers','Parameters.js');

module.exports = class MerchantProviderGeneralFilter {

	constructor(){

		this.parameter_validation = {
			'creditcard':global.SixCRM.routes.path('model','entities/creditcard.json'),
			'merchantproviders':global.SixCRM.routes.path('model','entities/components/merchantproviders.json'),
			'amount':global.SixCRM.routes.path('model','definitions/currency.json'),
			'merchantprovidergroup':global.SixCRM.routes.path('model','entities/merchantprovidergroup.json')
		};

		this.parameter_definition = {
			filter:{
				required:{
					merchantproviders:'merchant_providers',
					creditcard: 'creditcard',
					amount: 'amount',
					merchantprovidergroup: 'merchantprovidergroup'
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
		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'filter'}))
			.then(() => this.executeFilter());

	}

	executeFilter(){
		let merchant_providers = this.parameters.get('merchantproviders');

		return this.filterInvalidMerchantProviders({merchant_providers: merchant_providers})
			.then((result) => this.filterDisabledMerchantProviders({merchant_providers: result}))
			.then((result) => this.filterZeroDistributionMerchantProviders({merchant_providers: result}))
			.then((result) => this.filterTypeMismatchedMerchantProviders({merchant_providers: result}))
			.then((result) => this.filterCAPShortageMerchantProviders({merchant_providers: result}))

	}

	filterInvalidMerchantProviders({merchant_providers}){
		if(!arrayutilities.nonEmpty(merchant_providers)){
			throw eu.getError('server', 'No merchant providers to select from.');
		}

		let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

			return (_.has(merchant_provider, 'summary'));

		});

		return Promise.resolve(return_array);

	}

	filterDisabledMerchantProviders({merchant_providers}){
		if(!arrayutilities.nonEmpty(merchant_providers)){
			throw eu.getError('server', 'No merchant providers to select from.');
		}

		let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {
			return (merchant_provider.enabled == true);
		});

		return Promise.resolve(return_array);

	}

	filterZeroDistributionMerchantProviders({merchant_providers}){
		const merchantprovidergroup = this.parameters.get('merchantprovidergroup');

		if(!arrayutilities.nonEmpty(merchant_providers)){
			throw eu.getError('server', 'No merchant providers to select from.');
		}

		let zero_distributions = [];

		if (merchantprovidergroup.merchantproviders) {
			zero_distributions = merchantprovidergroup.merchantproviders.filter(mp => !mp.distribution).map(mp => mp.id);
		}

		const return_array = merchant_providers.filter(mp => !zero_distributions.includes(mp.id));

		return Promise.resolve(return_array);

	}

	filterTypeMismatchedMerchantProviders({merchant_providers}){
		let creditcard = this.parameters.get('creditcard');

		if(!arrayutilities.nonEmpty(merchant_providers)){
			throw eu.getError('server', 'No merchant providers to select from.');
		}

		let return_array = arrayutilities.filter(merchant_providers, (merchant_provider) => {

			let accepted_payment_methods_array = arrayutilities.map(merchant_provider.accepted_payment_methods, (accepted_payment_method) => {
				return this.makeGeneralBrandString(accepted_payment_method);
			});

			const creditcard_types = creditCardType(creditcard.bin);

			if (creditcard_types.length !== 1) {
				throw eu.getError('server', 'Could not determine credit card type.');
			}

			const creditcard_type = this.makeGeneralBrandString(creditcard_types[0].niceType);

			return _.includes(accepted_payment_methods_array, creditcard_type);

		});

		return Promise.resolve(return_array);

	}

	filterCAPShortageMerchantProviders({merchant_providers}){
		let amount = this.parameters.get('amount');

		if(!arrayutilities.nonEmpty(merchant_providers)){
			throw eu.getError('server', 'No merchant providers to select from.');
		}

		merchant_providers = arrayutilities.filter(merchant_providers, (merchant_provider) => {

			if(objectutilities.hasRecursive(merchant_provider, 'processing.monthly_cap') && !_.isNull(merchant_provider.processing.monthly_cap)){

				//Technical Debt:  Lets abstract this to a different function
				let proposed_total = (parseFloat(merchant_provider.summary.summary.thismonth.amount) + parseFloat(amount));
				let cap = parseFloat(merchant_provider.processing.monthly_cap);

				if((proposed_total > cap)){
					du.warning('CAP Shortage')
					return false;
				}

			}

			return true;

		});


		return Promise.resolve(merchant_providers);

	}

	makeGeneralBrandString(a_string){
		stringutilities.isString(a_string, true);

		let transformed_string = stringutilities.removeWhitespace(a_string).toLowerCase();

		if(_.has(this.brandaliases, transformed_string)){
			transformed_string = this.brandaliases[transformed_string];
		}

		return transformed_string;

	}

}
