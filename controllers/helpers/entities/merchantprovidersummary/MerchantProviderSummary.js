
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const numberutilities = require('@6crm/sixcrmcore/util/number-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const MerchantProviderSummaryController = global.SixCRM.routes.include('entities', 'MerchantProviderSummary.js');

module.exports = class MerchantProviderSummaryHelperController {

	constructor(){

		this.parameter_definition = {
			incrementMerchantProviderSummary:{
				required:{
					merchantproviderid:'merchant_provider',
					day:'day',
					type:'type',
					total:'total'
				},
				optional:{}
			},
			getMerchantProviderSummaries:{
				required:{
					merchantproviders: 'merchant_providers'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			'merchantproviderid':global.SixCRM.routes.path('model','definitions/uuidv4.json'),
			'merchantprovidersummary':global.SixCRM.routes.path('model', 'entities/merchantprovidersummary.json'),
			'day':global.SixCRM.routes.path('model','definitions/iso8601.json'),
			'type':global.SixCRM.routes.path('model','definitions/sixcrmtransactiontype.json'),
			'total':global.SixCRM.routes.path('model','definitions/currency.json'),
			'summary':global.SixCRM.routes.path('model','entities/merchantprovidersummary.json')
		};

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

		this.merchantProviderSummaryController = new MerchantProviderSummaryController();

	}

	incrementMerchantProviderSummary(){

		du.debug('Increment Merchant Provider Summary');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'incrementMerchantProviderSummary'}))
			.then(() => this.validateDay())
			.then(() => this.getMerchantProviderSummary())
			.then(() => this.incrementSummary());

	}

	validateDay(){

		du.debug('Validate Day');

		let day = this.parameters.get('day');

		if(!timestamp.isToday(day, 10)){
			throw eu.getError('server','You may not increment a merchant provider summary for a day other than today.');
		}

		return true;

	}

	getMerchantProviderSummary(){

		du.debug('Get Merchant Provider Summary');

		let day = this.parameters.get('day');
		let type = this.parameters.get('type');
		let merchant_provider = this.parameters.get('merchantproviderid');

		let start = timestamp.startOfDay(day);
		let end = timestamp.endOfDay(day);

		return this.merchantProviderSummaryController.listByMerchantProviderAndDateRange({merchant_providers:[merchant_provider], start:start, end:end, type: type})
			.then((result) => this.merchantProviderSummaryController.getResult(result, 'merchantprovidersummaries'))
			.then(result => {

				if(!_.isNull(result) && arrayutilities.nonEmpty(result)){
					if(result.length != 1){
						throw eu.getError('server', 'Unexpected Dynamo response.');
					}
					this.parameters.set('merchantprovidersummary', result.pop());
					return true;
				}

				let merchant_provider_summary_prototype = this.createPrototype({merchant_provider: merchant_provider, day: day, type: type});

				return this.merchantProviderSummaryController.create({entity: merchant_provider_summary_prototype}).then(result => {
					this.parameters.set('merchantprovidersummary', result);
					return true;
				});

			});

	}

	createPrototype({merchant_provider, day, type}){

		du.debug('Create Prototype');

		return {
			merchant_provider: merchant_provider,
			day: timestamp.startOfDay(day),
			total: 0.0,
			count: 0,
			type: type
		};

	}

	incrementSummary(){

		du.debug('Increment Summary');

		let merchant_provider_summary = this.parameters.get('merchantprovidersummary');
		let total = this.parameters.get('total');

		merchant_provider_summary.total = numberutilities.formatFloat((numberutilities.formatFloat(merchant_provider_summary.total) + numberutilities.formatFloat(total, 2)), 2);
		merchant_provider_summary.count = merchant_provider_summary.count + 1;

		return this.merchantProviderSummaryController.update({entity: merchant_provider_summary}).then(result => {
			this.parameters.set('merchantprovidersummary', result);
			return true;
		});

	}

	getMerchantProviderSummaries(){

		du.debug('Get Merchant Provider Summaries');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action:'getMerchantProviderSummaries'}))
			.then(() => this.acquireMerchantProviderSummaries())
			.then(() => this.formatResponse());

	}

	acquireMerchantProviderSummaries(){

		du.debug('Acquire Merchant Provider Summaries');

		let merchant_providers = this.parameters.get('merchantproviders');
		let start = timestamp.startOfMonth();

		return this.merchantProviderSummaryController.listByMerchantProviderAndDateRange({merchant_providers: merchant_providers,start: start})
			.then((result) => this.merchantProviderSummaryController.getResult(result, 'merchantprovidersummaries'))
			.then(result => {
				this.parameters.set('merchantprovidersummaries', result || []);
				return true;
			});

	}

	formatResponse(){

		du.debug('Format Response');

		let merchant_providers = this.parameters.get('merchantproviders');
		let merchant_provider_summaries = this.parameters.get('merchantprovidersummaries', {fatal: false});

		let return_object = {};

		return_object.merchant_providers = arrayutilities.map(merchant_providers, merchant_provider => {

			let merchant_provider_specific_merchant_provider_summaries = arrayutilities.filter(merchant_provider_summaries, merchant_provider_summary => {
				return merchant_provider_summary.merchant_provider == merchant_provider;
			});

			return {
				merchant_provider: {
					id: merchant_provider
				},
				summary: {
					today: this.aggregateTodaysSummaries(merchant_provider_specific_merchant_provider_summaries),
					thisweek: this.aggregateThisWeeksSummaries(merchant_provider_specific_merchant_provider_summaries),
					thismonth: this.aggregateThisMonthsSummaries(merchant_provider_specific_merchant_provider_summaries)
				}
			}

		});

		return return_object;

	}

	aggregateThisMonthsSummaries(merchant_provider_summaries){

		du.debug('Aggregate This Months Summaries');

		return this.aggregateAfter(merchant_provider_summaries, 'this_month');

	}

	aggregateThisWeeksSummaries(merchant_provider_summaries){

		du.debug('Aggregate This Weeks Summaries');

		return this.aggregateAfter(merchant_provider_summaries, 'this_week');

	}

	aggregateTodaysSummaries(merchant_provider_summaries){

		du.debug('Aggregate Todays Summaries');

		return this.aggregateAfter(merchant_provider_summaries, 'today');

	}

	aggregateAfter(merchant_provider_summaries, start_indicator){

		du.debug('Aggregate After');

		let starts = {
			'today': timestamp.startOfDay(),
			'this_week': timestamp.startOfWeek(),
			'this_month':timestamp.startOfMonth()
		};

		let start = starts[start_indicator];
		let summary_object = {
			count: 0,
			amount: 0
		};

		return arrayutilities.reduce(
			merchant_provider_summaries,
			(current, merchant_provider_summary) => {
				if(merchant_provider_summary.day >= start){
					current.count += parseInt(merchant_provider_summary.count);
					current.amount += numberutilities.formatFloat(merchant_provider_summary.total, 2);
				}
				return current;
			},
			summary_object
		);

	}



}
