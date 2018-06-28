const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const TransactionUtilities = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');
const BinController = global.SixCRM.routes.include('controllers', 'entities/Bin.js');
const CreditCardController = global.SixCRM.routes.include('controllers', 'entities/CreditCard.js');
const CreditCardHelperController = global.SixCRM.routes.include('helpers', 'entities/creditcard/CreditCard.js');
const MerchantProviderGroupController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroup.js');
const MerchantProviderGroupAssociationController = global.SixCRM.routes.include('controllers', 'entities/MerchantProviderGroupAssociation.js');
const RebillController = global.SixCRM.routes.include('controllers', 'entities/Rebill.js');

module.exports = class MerchantProviderSelector extends TransactionUtilities {

	constructor() {

		super();

		this.parameter_definition = {
			buildMerchantProviderGroups: {
				required: {
					rebill: 'rebill',
					creditcard: 'creditcard'
				},
				optional: {}
			},
			selectMerchantProviderFromMerchantProviderGroup: {
				required: {
					'smp.merchantprovidergroupid': 'merchantprovidergroup_id',
					'smp.amount': 'amount',
					'smp.creditcard': 'creditcard'
				},
				optional: {}
			}
		};

		this.parameter_validation = {
			'rebill': global.SixCRM.routes.path('model', 'entities/rebill.json'),
			'session': global.SixCRM.routes.path('model', 'entities/session.json'),
			'creditcard': global.SixCRM.routes.path('model', 'entities/creditcard.json'),
			'sortedmarriedproductgroups': global.SixCRM.routes.path('model', 'helpers/transaction/merchantproviderselector/sortedmarriedproductgroups.json'),
			'smp.merchantprovidergroupid': global.SixCRM.routes.path('model', 'definitions/uuidv4.json'),
			'smp.amount': global.SixCRM.routes.path('model', 'definitions/currency.json'),
			'smp.creditcard': global.SixCRM.routes.path('model', 'entities/creditcard.json')
		};

		this.instantiateParameters();

		this.rebillController = new RebillController();
		this.merchantProviderGroupController = new MerchantProviderGroupController();
		this.merchantProviderGroupAssociationController = new MerchantProviderGroupAssociationController();
		this.creditCardController = new CreditCardController();
		this.creditCardHelperController = new CreditCardHelperController();
		this.binController = new BinController();

		this.creditCardController.sanitize(false);
		this.merchantProviderGroupController.sanitize(false);
		this.merchantProviderGroupAssociationController.sanitize(false);
	}

	buildMerchantProviderGroups() {

		du.debug('Build Merchant Provider Groups');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({
				argumentation: arguments[0],
				action: 'buildMerchantProviderGroups'
			}))
			.then(() => this.acquireRebillProperties())
			.then(() => this.acquireMerchantProviderGroupAssociations())
			.then(() => this.acquireCreditCardProperties())
			.then(() => this.sortRebillProductsByMerchantProviderGroupAssociations())
			.then(() => this.transformMerchantProviderGroupsToMerchantProviders());

	}

	acquireCreditCardProperties() {

		du.debug('Acquire CreditCard Properties');

		return this.acquireCreditCard()
			.then(() => this.setCreditCardBINNumber());

	}

	transformMerchantProviderGroupsToMerchantProviders() {

		du.debug('Transform Merchant Provider Groups To Merchant Providers');

		let creditcard = this.parameters.get('creditcard');
		let sorted_married_product_groups = this.parameters.get('sortedmarriedproductgroups');

		let transformed_married_product_groups_promises = objectutilities.map(sorted_married_product_groups, merchantprovidergroup => {

			let amount = this.calculateAmount(sorted_married_product_groups[merchantprovidergroup]);

			return this.selectMerchantProviderFromMerchantProviderGroup({
				merchantprovidergroup_id: merchantprovidergroup,
				amount: amount,
				creditcard: creditcard
			})
				.then((selected_merchant_provider) => {
					return {
						merchant_provider: selected_merchant_provider.id,
						product_group: sorted_married_product_groups[merchantprovidergroup]
					}
				});

		});

		return Promise.all(transformed_married_product_groups_promises).then(results => {

			return arrayutilities.reduce(results, (return_object, result) => {

				if (!_.has(return_object, result.merchant_provider)) {
					return_object[result.merchant_provider] = [];
				}

				return_object[result.merchant_provider].push(result.product_group);

				return return_object;

			}, {});

		});


	}

	selectMerchantProviderFromMerchantProviderGroup() {

		du.debug('Select Merchant Provider');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({
				argumentation: arguments[0],
				action: 'selectMerchantProviderFromMerchantProviderGroup'
			}))
			.then(() => this.getMerchantProviderGroup())
			.then(() => this.getMerchantProviders())
			.then(() => this.getMerchantProviderSummaries())
			.then(() => this.marryMerchantProviderSummaries())
			.then(() => this.getMerchantProviderGroupSummary())
			.then(() => this.filterMerchantProviders())
			.then(() => {

				let merchant_provider = this.parameters.get('smp.merchantprovider');

				return merchant_provider;

			});

	}

	getMerchantProviderGroup() {

		du.debug('Get Merchantprovidergroup');

		let merchantprovidergroup_id = this.parameters.get('smp.merchantprovidergroupid');

		return this.merchantProviderGroupController.get({
			id: merchantprovidergroup_id
		}).then((merchantprovidergroup) => {

			this.parameters.set('smp.merchantprovidergroup', merchantprovidergroup);

			return true;

		});

	}

	getMerchantProviderGroupSummary() {

		du.debug('Get Merchantprovidergroup Summary');

		let merchantprovidergroup = this.parameters.get('smp.merchantprovidergroup');
		let merchant_providers = this.parameters.get('smp.merchantproviders');

		let monthly_summary = arrayutilities.serial(merchantprovidergroup.merchantproviders, (current, next) => {

			let merchant_provider = arrayutilities.find(merchant_providers, merchant_provider => {
				return (merchant_provider.id == next.id);
			});

			current = current + parseFloat(merchant_provider.summary.summary.thismonth.amount);

			return current;

		},
		0.0
		);

		merchantprovidergroup.summary = {
			month: {
				sum: monthly_summary
			}
		};

		this.parameters.set('merchantprovidergroup', merchantprovidergroup);

	}

	getMerchantProviders() {

		du.debug('Get Merchant Providers');

		let merchantprovidergroup = this.parameters.get('smp.merchantprovidergroup');

		return this.merchantProviderGroupController.getMerchantProviders(merchantprovidergroup).then((merchant_providers) => {

			this.parameters.set('smp.merchantproviders', merchant_providers);

			return true;

		});

	}

	getMerchantProviderSummaries() {

		du.debug('Get Merchant Provider Summaries');

		let merchant_providers = this.parameters.get('smp.merchantproviders');

		let merchant_provider_ids = arrayutilities.map(merchant_providers, merchant_provider => merchant_provider.id);

		const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
		let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

		return merchantProviderSummaryHelperController.getMerchantProviderSummaries({
			merchant_providers: merchant_provider_ids
		}).then(results => {

			this.parameters.set('smp.merchantprovidersummaries', results.merchant_providers);

			return true;

		});

	}

	marryMerchantProviderSummaries() {

		du.debug('Marry Merchant Provider Summaries');

		let merchant_provider_summaries = this.parameters.get('smp.merchantprovidersummaries');
		let merchant_providers = this.parameters.get('smp.merchantproviders');

		arrayutilities.map(merchant_provider_summaries, (summary) => {

			arrayutilities.filter(merchant_providers, (merchant_provider, index) => {

				if (merchant_provider.id == summary.merchant_provider.id) {
					merchant_providers[index].summary = summary;
				}

			});

		});

		this.parameters.set('smp.merchantproviders', merchant_providers);

		return Promise.resolve(true);

	}

	filterMerchantProviders() {

		du.debug('Filter Merchant Providers');

		let merchant_providers = this.parameters.get('smp.merchantproviders');
		let creditcard = this.parameters.get('smp.creditcard');
		let amount = this.parameters.get('smp.amount');
		let merchantprovidergroup = this.parameters.get('smp.merchantprovidergroup');

		const MerchantProviderGeneralFilter = global.SixCRM.routes.include('helpers', 'transaction/filters/MerchantProviderGeneralFilter.js');
		const merchantProviderGeneralFilter = new MerchantProviderGeneralFilter();
		const MerchantProviderLSSFilter = global.SixCRM.routes.include('helpers', 'transaction/filters/MerchantProviderLSSFilter.js');
		const merchantProviderLSSFilter = new MerchantProviderLSSFilter();

		return merchantProviderGeneralFilter.filter({
			merchant_providers: merchant_providers,
			creditcard: creditcard,
			amount: amount
		})
			.then((merchant_providers) => merchantProviderLSSFilter.filter({
				merchant_providers: merchant_providers,
				creditcard: creditcard,
				amount: amount,
				merchantprovidergroup: merchantprovidergroup
			}))
			.then(merchant_provider => {
				this.parameters.set('smp.merchantprovider', merchant_provider);
				return true;
			});

	}

	pickMerchantProvider() {

		du.debug('Pick Merchant Provider');

	}

	acquireCreditCard() {

		du.debug('Acquire Credit Card');

		let creditcard = this.parameters.get('creditcard');

		return this.creditCardController.get({
			id: creditcard
		}).then(result => {

			this.parameters.set('creditcard', result);

			return true;

		});

	}

	setCreditCardBINNumber() {

		du.debug('Set CreditCard BIN Number');

		let creditcard = this.parameters.get('creditcard');

		let binnumber = this.creditCardHelperController.getBINNumber(creditcard);

		if (_.isNull(binnumber)) {

			throw eu.getError('server', 'Unable to determine BIN Number.');

		}

		creditcard.bin = binnumber;

		this.parameters.set('creditcard', creditcard);

		return true;

	}

	getCreditCardProperties() {

		du.debug('Get Credit Card Properties');

		let creditcard = this.parameters.get('creditcard');

		return this.binController.getCreditCardProperties({
			binnumber: parseInt(creditcard.bin)
		}).then((properties) => {

			if (_.isNull(properties)) {
				throw eu.getError('not_found', 'Unable to identify credit card properties.');
			}

			creditcard.properties = properties;

			this.parameters.set('creditcard', creditcard);

			return properties;

		});

	}

	calculateAmount(product_group_group) {

		du.debug('Calculate Amount');

		return arrayutilities.serial(
			product_group_group,
			(current, next) => {
				return (current + (next.amount * next.quantity));
			},
			0.0
		);

	}

	sortRebillProductsByMerchantProviderGroupAssociations() {

		du.debug('sortRebillProductsByMerchantProviderGroupAssociations');

		let rebill = this.parameters.get('rebill');
		let campaign_id = this.parameters.get('session').campaign;
		let associated_merchant_provider_groups = this.parameters.get('merchantprovidergroupassociations');

		let married_product_groups = arrayutilities.map(rebill.products, product_group => {

			let associated_merchant_provider_group = arrayutilities.find(associated_merchant_provider_groups, associated_merchant_provider_group => {
				return (associated_merchant_provider_group.entity == product_group.product.id);
			});

			if (_.isNull(associated_merchant_provider_group) || _.isUndefined(associated_merchant_provider_group)) {

				associated_merchant_provider_group = arrayutilities.find(associated_merchant_provider_groups, associated_merchant_provider_group => {
					return (associated_merchant_provider_group.entity == campaign_id);
				});

			}

			if (_.isNull(associated_merchant_provider_group) || _.isUndefined(associated_merchant_provider_group)) {
				throw eu.getError('server', `Unable to establish a merchantprovidergroup association between product ${product_group.product.id} and campaign ${campaign_id}`);
			}

			product_group.merchantprovidergroupassociation = associated_merchant_provider_group;

			return product_group;

		});

		let sorted_product_groups = arrayutilities.group(married_product_groups, married_product_group => {
			return married_product_group.merchantprovidergroupassociation.merchantprovidergroup;
		});

		this.parameters.set('sortedmarriedproductgroups', sorted_product_groups);

		return true;

	}

	acquireRebillProperties() {

		du.debug('Acquire Rebill Properties');

		let rebill = this.parameters.get('rebill');

		var promises = [
			this.rebillController.getParentSession(rebill)
		];

		return Promise.all(promises).then((promises) => {

			this.parameters.set('session', promises[0]);

			return true;

		});

	}

	acquireMerchantProviderGroupAssociations() {

		du.debug('Acquire Merchant Provider Group Associations');

		let rebill = this.parameters.get('rebill');
		let campaign_id = this.parameters.get('session').campaign;

		let product_ids = arrayutilities.map(rebill.products, product_group => product_group.product.id);

		let promises = [
			this.getMerchantProviderGroupsByEntityAndCampaign({
				entities: product_ids,
				campaign: campaign_id
			}),
			this.getMerchantProviderGroupsByCampaign({
				campaign: campaign_id
			})
		]

		return Promise.all(promises).then(promises => {

			arrayutilities.map(promises, promise => {
				if (arrayutilities.nonEmpty(promise)) {
					arrayutilities.map(promise, merchantprovidergroup => {
						this.parameters.push('merchantprovidergroupassociations', merchantprovidergroup);
					});
				}
			});

			return true;

		});

	}

	getMerchantProviderGroupsByEntityAndCampaign({
		entities,
		campaign
	}) {

		du.debug('Get Merchantprovidergroups By Entity And Campaign');

		return this.merchantProviderGroupAssociationController.listByEntitiesAndCampaign({
			entities: entities,
			campaign: campaign
		})
			.then(result => this.merchantProviderGroupAssociationController.getResult(result, 'merchantprovidergroupassociations'));

	}

	getMerchantProviderGroupsByCampaign({
		campaign
	}) {

		du.debug('Get Merchantprovidergroups By Campaign');

		return this.merchantProviderGroupAssociationController.listByCampaign({
			campaign: campaign
		})
			.then(result => this.merchantProviderGroupAssociationController.getResult(result, 'merchantprovidergroupassociations'));

	}

}
