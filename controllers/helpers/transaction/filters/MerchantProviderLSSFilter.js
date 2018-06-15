
const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const numberutilities = require('@sixcrm/sixcrmcore/util/number-utilities').default;
const mathutilities = require('@sixcrm/sixcrmcore/util/math-utilities').default;
const Parameters = global.SixCRM.routes.include('providers','Parameters.js');

module.exports = class MerchantProviderLSSFilter {

	constructor(){

		this.parameter_validation = {
			'merchantprovidergroup':global.SixCRM.routes.path('model','entities/merchantprovidergroup.json'),
			'merchantproviders':global.SixCRM.routes.path('model','entities/components/merchantproviders.json'),
			'amount':global.SixCRM.routes.path('model','definitions/currency.json'),
			'distributiontargets':global.SixCRM.routes.path('model','helpers/transaction/merchantproviderselector/filters/LSS/distributiontargets.json'),
			'hypotheticaldistributions':global.SixCRM.routes.path('model','helpers/transaction/merchantproviderselector/filters/LSS/distributiontargets.json')
		};

		this.parameter_definition = {
			filter:{
				required:{
					merchantproviders:'merchant_providers',
					merchantprovidergroup: 'merchantprovidergroup',
					amount: 'amount'
				},
				optional:{}
			}
		};

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

	}

	filter(){

		du.debug('Select Merchant Provider With Distribution Least Sum of Squares');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'filter'}))
			.then(() => this.executeFilter());

	}

	executeFilter(){

		du.debug('Execute Filter');

		let merchant_providers = this.parameters.get('merchantproviders');

		if(merchant_providers.length == 1){ return merchant_providers[0]; }

		return this.calculateDistributionTargetsArray()
			.then(() => this.calculateHypotheticalBaseDistributionArray())
			.then(() => this.selectMerchantProviderFromLSS())
			.then((result) => {
				du.info({'Selected merchant provider': result})
				return result;
			});

	}

	calculateDistributionTargetsArray(){

		du.debug('Calculate Distribution Targets Array');

		let merchant_providers = this.parameters.get('merchantproviders');

		let distribution_targets_array = arrayutilities.map(merchant_providers, (merchant_provider) => {
			return this.getMerchantProviderTargetDistribution({merchant_provider: merchant_provider});
		});

		return Promise.all(distribution_targets_array).then(distribution_targets_array => {

			this.parameters.set('distributiontargets', distribution_targets_array);

			return true;

		});

	}

	getMerchantProviderTargetDistribution({merchant_provider}){

		du.debug('Get Merchant Provider Target Distribution');

		let merchantprovidergroup = this.parameters.get('merchantprovidergroup');

		//Technical Debt:  Upgrade the JSON Schemas
		if(!arrayutilities.nonEmpty(merchantprovidergroup.merchantproviders)){
			throw eu.getError('server','Process.getMerchantProviderTarget assumes that the selected_merchantprovidergroup.merchantproviders an array and has length greater than 0');
		}

		let merchantprovidergroup_mp = arrayutilities.find(merchantprovidergroup.merchantproviders, (lb_mp) => {
			return (lb_mp.id == merchant_provider.id);
		});

		if(!_.has(merchantprovidergroup_mp, 'id') || !_.has(merchantprovidergroup_mp, 'distribution')){
			throw eu.getError('server','Process.getMerchantProviderTarget is unable to determine the merchant_provider');
		}

		return Promise.resolve(merchantprovidergroup_mp.distribution);

	}

	calculateHypotheticalBaseDistributionArray(){

		du.debug('Calculate Hypothetical Base Distribution Array');

		let merchant_providers = this.parameters.get('merchantproviders');

		let hypothetical_distribution_base_array = arrayutilities.map(merchant_providers, (merchant_provider) => {
			return this.getMerchantProviderHypotheticalBaseDistribution({merchant_provider: merchant_provider});
		});

		return Promise.all(hypothetical_distribution_base_array)
			.then(hypothetical_distribution_base_array => {

				this.parameters.set('hypotheticaldistributions', hypothetical_distribution_base_array);

				return true;

			});

	}

	getMerchantProviderHypotheticalBaseDistribution({merchant_provider, additional_amount}){

		du.debug('Get Merchant Provider Hypothetical Base Distribution');

		additional_amount = (_.isUndefined(additional_amount) || _.isNull(additional_amount))?0:numberutilities.toNumber(additional_amount);

		let amount = this.parameters.get('amount');
		let merchantprovidergroup = this.parameters.get('merchantprovidergroup');

		//Technical Debt:  Upgrade the JSON Schemas
		if(!objectutilities.hasRecursive(merchantprovidergroup, 'summary.month.sum')){
			throw eu.getError('server', 'Process.getMerchantProviderDistribution assumes that selected_merchantprovidergroup.monthly_sum is set');
		}

		//Technical Debt:  Upgrade the JSON Schemas
		if(!objectutilities.hasRecursive(merchant_provider, 'summary.summary.thismonth.amount')){
			throw eu.getError('server', 'Process.getMerchantProviderDistribution assumes that merchantprovider.summary.summary.thismonth.amount property is set');
		}

		let numerator = (numberutilities.toNumber(merchant_provider.summary.summary.thismonth.amount) + additional_amount);
		let denominator = (numberutilities.toNumber(merchantprovidergroup.summary.month.sum) + amount);
		let percentage = mathutilities.safePercentage(numerator, denominator, 8);

		return (percentage / 100);

	}

	selectMerchantProviderFromLSS(){

		du.debug('Select Merchant Provider From LSS');

		let hypothetical_distribution_base_array = this.parameters.get('hypotheticaldistributions');
		let target_distribution_array = this.parameters.get('distributiontargets');
		let merchant_providers = this.parameters.get('merchantproviders');
		let amount = this.parameters.get('amount');
		let lss = null;

		//Technical Debt:  This is difficult to test.
		return arrayutilities.reduce(
			merchant_providers,
			(selected_merchant_provider, merchant_provider, index) => {

				let hypothetical_distribution_base_array_clone = objectutilities.clone(hypothetical_distribution_base_array);

				hypothetical_distribution_base_array_clone[(index - 1)] += this.getMerchantProviderHypotheticalBaseDistribution({merchant_provider: merchant_provider, amount: amount});

				let ss = mathutilities.calculateLSS(target_distribution_array, hypothetical_distribution_base_array_clone);

				if(_.isNull(selected_merchant_provider) || !_.isNull(lss) && ss < lss){
					lss = ss;
					return  merchant_provider;
				}

				return selected_merchant_provider;

			},
			null
		);

	}

}

