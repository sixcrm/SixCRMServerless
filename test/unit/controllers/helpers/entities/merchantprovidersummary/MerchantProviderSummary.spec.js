
const mockery = require('mockery');
let chai = require('chai');
const expect = chai.expect;
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidMerchantProvider(){
	return MockEntities.getValidMerchantProvider();
}

function getValidMerchantProviderSummary(){
	return MockEntities.getValidMerchantProviderSummary();
}

describe('/helpers/entities/merchantprovidersummary/MerchantProviderSummary.json', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			expect(objectutilities.getClassName(merchantProviderSummaryHelperController)).to.equal('MerchantProviderSummaryHelperController');

		});

	});

	describe('incrementSummary', () =>{

		it('successfully increments total and count', () => {

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			//Technical Debt:  This is busted... fix.
			let test_cases = [
				{
					summary: {
						total: 123456.01,
						count: 22
					},
					total: 12.91,
					results:{
						count: 23,
						total: (123456.01 + 12.91)
					}
				}
			];

			let promises = arrayutilities.map(test_cases, test_case => {

				let mps = getValidMerchantProviderSummary();

				mps.total = test_case.summary.total;
				mps.count = test_case.summary.count;

				merchantProviderSummaryHelperController.parameters.set('merchantprovidersummary', mps);
				merchantProviderSummaryHelperController.parameters.set('total', test_case.total);

				return () => {
					return merchantProviderSummaryHelperController.incrementSummary().then((result) => {
						expect(result).to.equal(true);
						let updated_merchant_provider_summary = merchantProviderSummaryHelperController.parameters.get('merchantprovidersummary');

						expect(updated_merchant_provider_summary.total).to.equal(test_case.results.total);
						expect(updated_merchant_provider_summary.count).to.equal(test_case.results.count);
					});
				};

			});

			return arrayutilities.serial(promises, (current, next) => {
				return next().then(() => {
					return true;
				});
			},null);

		});

		it('successfully increments summary', () => {

			let mps = getValidMerchantProviderSummary();

			let updated_mps = objectutilities.clone(mps);

			let total = 10.00; //any number

			updated_mps.total = numberutilities.formatFloat(total + mps.total);
			updated_mps.count++;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				update({entity}) {
					expect(entity).to.equal(mps);

					return Promise.resolve(entity);
				}
			});

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			merchantProviderSummaryHelperController.parameters.set('merchantprovidersummary', mps);
			merchantProviderSummaryHelperController.parameters.set('total', total);

			return merchantProviderSummaryHelperController.incrementSummary().then((result) => {

				let updated_merchant_provider_summary = merchantProviderSummaryHelperController.parameters.get('merchantprovidersummary');

				expect(updated_merchant_provider_summary.total).to.equal(updated_mps.total);
				expect(updated_merchant_provider_summary.count).to.equal(updated_mps.count);
				return expect(result).to.equal(true);
			});

		});

	});

	describe('validateDay', () => {

		it('returns true', () => {

			let day = timestamp.getISO8601();

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			merchantProviderSummaryHelperController.parameters.set('day', day);

			expect(merchantProviderSummaryHelperController.validateDay()).to.equal(true);

		});

		it('returns an error', () => {

			let day = timestamp.castToISO8601(timestamp.yesterday());

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			merchantProviderSummaryHelperController.parameters.set('day', day);

			try{
				expect(merchantProviderSummaryHelperController.validateDay())
			}catch(error){
				expect(error.message).to.equal('[500] You may not increment a merchant provider summary for a day other than today.');
			}

		});

	});

	describe('incrementMerchantProviderSummary', () => {

		it('successfully increments', () => {

			let merchant_provider = getValidMerchantProvider();
			let merchant_provider_summary = getValidMerchantProviderSummary();
			let day = timestamp.getISO8601();
			let type = 'new';
			let total = 44.99;

			merchant_provider_summary.merchant_provider = merchant_provider.id;
			merchant_provider_summary.day = day;
			merchant_provider_summary.type = type;
			merchant_provider_summary.count = 32;
			merchant_provider_summary.total = 3213.87;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
				create() {
					return Promise.resolve(merchant_provider_summary);
				}
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: [merchant_provider_summary]});
				}
				getResult() {
					return merchant_provider_summary;
				}
			});

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			return merchantProviderSummaryHelperController.incrementMerchantProviderSummary({merchant_provider: merchant_provider.id, day:day, type:type, total:total}).then(result => {
				expect(merchantProviderSummaryHelperController.parameters.store['merchantprovidersummary'].count).to.equal(33);
				expect(merchantProviderSummaryHelperController.parameters.store['merchantprovidersummary'].total).to.equal(3258.86);
				expect(result).to.equal(true);
			});

		});

	});

	describe('getMerchantProviderSummaries', () => {

		it('successfully retrieves merchant provider summaries', () => {

			let merchant_provider = getValidMerchantProvider();

			let merchant_provider_summary = getValidMerchantProviderSummary();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: [merchant_provider_summary]});
				}
				getResult() {
					return [merchant_provider_summary];
				}
			});

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			return merchantProviderSummaryHelperController.getMerchantProviderSummaries({merchant_providers: [merchant_provider]}).then(result => {
				expect(merchantProviderSummaryHelperController.parameters.store['merchantprovidersummaries']).to.deep.equal([merchant_provider_summary]);
				expect(result).to.deep.equal({merchant_providers: [{
					merchant_provider: {
						id: merchant_provider
					},
					summary: {
						thismonth: {
							amount: 0,
							count: 0
						},
						thisweek: {
							amount: 0,
							count: 0
						},
						today: {
							amount: 0,
							count: 0
						}
					}
				}]
				});
			});

		});

	});

	describe('aggregateTodaysSummaries', () => {

		it('aggregates after today', () => {

			let mps = [
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary()
			];


			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			let result = {
				count: 0,
				amount: 0
			};

			arrayutilities.map(mps, (merchant_provider) => {
				result.count += parseInt(merchant_provider.count);
				result.amount += numberutilities.formatFloat(merchant_provider.total, 2);
			});

			expect(merchantProviderSummaryHelperController.aggregateTodaysSummaries(mps)).to.deep.equal(result);

		});

		it('aggregates after today and skips merchant provider summaries in the past', () => {

			let mps = [
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary()
			];

			//any mps with the day in the past will be skipped
			mps[1].day = "2018-03-20T14:04:45.963Z";
			mps[2].day = "2018-03-20T14:04:45.963Z";

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			expect(merchantProviderSummaryHelperController.aggregateTodaysSummaries(mps)).to.deep.equal({
				count: parseInt(mps[0].count),
				amount: numberutilities.formatFloat(mps[0].total, 2)
			});

		});

	});

	describe('aggregateThisWeeksSummaries', () => {

		it('aggregates after this week', () => {

			let mps = [
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary()
			];

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			let result = {
				count: 0,
				amount: 0
			};

			arrayutilities.map(mps, (merchant_provider) => {
				result.count += parseInt(merchant_provider.count);
				result.amount += numberutilities.formatFloat(merchant_provider.total, 2);
			});

			expect(merchantProviderSummaryHelperController.aggregateThisWeeksSummaries(mps)).to.deep.equal(result);

		});

		it('aggregates after this week and skips merchant provider summaries in the past', () => {

			let mps = [
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary()
			];

			//any mps with the day in the past will be skipped
			mps[1].day = "2018-02-20T14:04:45.963Z";
			mps[2].day = "2018-02-20T14:04:45.963Z";

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			expect(merchantProviderSummaryHelperController.aggregateThisWeeksSummaries(mps)).to.deep.equal({
				count: parseInt(mps[0].count),
				amount: numberutilities.formatFloat(mps[0].total, 2)
			});

		});

	});

	describe('aggregateThisMonthsSummaries', () => {

		it('aggregates after this month', () => {

			let mps = [
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary()
			];

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			let result = {
				count: 0,
				amount: 0
			};

			arrayutilities.map(mps, (merchant_provider) => {
				result.count += parseInt(merchant_provider.count);
				result.amount += numberutilities.formatFloat(merchant_provider.total, 2);
			});

			expect(merchantProviderSummaryHelperController.aggregateThisMonthsSummaries(mps)).to.deep.equal(result);

		});

		it('aggregates after this month and skips merchant provider summaries in the past', () => {

			let mps = [
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary(),
				getValidMerchantProviderSummary()
			];

			//any mps with the day in the past will be skipped
			mps[1].day = "2018-02-20T14:04:45.963Z";
			mps[2].day = "2018-02-20T14:04:45.963Z";

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			expect(merchantProviderSummaryHelperController.aggregateThisMonthsSummaries(mps)).to.deep.equal({
				count: parseInt(mps[0].count),
				amount: numberutilities.formatFloat(mps[0].total, 2)
			});

		});

	});

	describe('acquireMerchantProviderSummaries', () => {

		it('successfully acquires merchant provider summaries', () => {

			let merchant_provider = getValidMerchantProvider();

			let merchant_provider_summary = getValidMerchantProviderSummary();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: [merchant_provider_summary]});
				}
				getResult() {
					return merchant_provider_summary;
				}
			});

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			merchantProviderSummaryHelperController.parameters.set('merchantproviders', [merchant_provider]);

			return merchantProviderSummaryHelperController.acquireMerchantProviderSummaries().then(result => {
				expect(merchantProviderSummaryHelperController.parameters.store['merchantprovidersummaries']).to.deep.equal(merchant_provider_summary);
				expect(result).to.equal(true);
			});

		});

	});

	describe('getMerchantProviderSummary', () => {

		it('successfully retrieves merchant provider summaries', () => {

			let merchant_provider_summary = getValidMerchantProviderSummary();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				create() {
					return Promise.resolve(merchant_provider_summary);
				}
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: [merchant_provider_summary]});
				}
				getResult() {
					return merchant_provider_summary;
				}
			});

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			merchantProviderSummaryHelperController.parameters.set('merchantproviderid', merchant_provider_summary.merchant_provider);
			merchantProviderSummaryHelperController.parameters.set('day', timestamp.getISO8601());
			merchantProviderSummaryHelperController.parameters.set('type', 'recurring');

			return merchantProviderSummaryHelperController.getMerchantProviderSummary().then(result => {
				expect(merchantProviderSummaryHelperController.parameters.store['merchantprovidersummary']).to.deep.equal(merchant_provider_summary);
				return expect(result).to.equal(true);
			});

		});

		it('throws error when there is more than one merchant provider returned from the dynamo', () => {

			let merchant_provider_summary = getValidMerchantProviderSummary();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: [merchant_provider_summary]});
				}
				getResult() {
					return [merchant_provider_summary, getValidMerchantProviderSummary()];
				}
			});

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			merchantProviderSummaryHelperController.parameters.set('merchantproviderid', merchant_provider_summary.merchant_provider);
			merchantProviderSummaryHelperController.parameters.set('day', timestamp.getISO8601());
			merchantProviderSummaryHelperController.parameters.set('type', 'recurring');

			return merchantProviderSummaryHelperController.getMerchantProviderSummary().catch((error) => {
				return expect(error.message).to.equal("[500] Unexpected Dynamo response.");
			});

		});

		it('successfully retrieves merchant provider summaries when dynamo result is an array of one merchant provider', () => {

			let merchant_provider_summary = getValidMerchantProviderSummary();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: [merchant_provider_summary]});
				}
				getResult() {
					return [merchant_provider_summary];
				}
			});

			const MerchantProviderSummaryHelperController = global.SixCRM.routes.include('helpers', 'entities/merchantprovidersummary/MerchantProviderSummary.js');
			let merchantProviderSummaryHelperController = new MerchantProviderSummaryHelperController();

			merchantProviderSummaryHelperController.parameters.set('merchantproviderid', merchant_provider_summary.merchant_provider);
			merchantProviderSummaryHelperController.parameters.set('day', timestamp.getISO8601());
			merchantProviderSummaryHelperController.parameters.set('type', 'recurring');

			return merchantProviderSummaryHelperController.getMerchantProviderSummary().then(result => {
				expect(merchantProviderSummaryHelperController.parameters.store['merchantprovidersummary']).to.deep.equal(merchant_provider_summary);
				return expect(result).to.equal(true);
			});

		});

	});

});
