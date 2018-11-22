const mockery = require('mockery');
const uuidv4 = require('uuid/v4');
const expect = require('chai').expect;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

const MerchantProviderLSSFilter = global.SixCRM.routes.include('helpers', 'transaction/filters/MerchantProviderLSSFilter.js');
const filter = new MerchantProviderLSSFilter();

describe('helpers/transaction/filters/MerchantProviderLSSFilter.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		global.disableactionchecks = true;
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
		mockery.disable();
		global.disableactionchecks = false;
	});

	it('should select a MID', async () => {


		const providers = [
			{
				"id": "6c40761d-8919-4ad6-884d-6a46a776cfb9",
				"account": "d3fa3bf3-7824-49f4-8261-87674482bf1c",
				"name": "NMI Account 1",
				"processor": {
					"name": "NMA"
				},
				"processing": {
					"monthly_cap": null,
					"discount_rate": 0.9,
					"transaction_fee": 0.06,
					"reserve_rate": 0.5,
					"maximum_chargeback_ratio": 0.17,
					"transaction_counts": {
						"daily": null,
						"monthly": null,
						"weekly": null
					}
				},
				"enabled": true,
				"gateway": {
					"type": "NMI",
					"name": "NMI",
					"username": "demo",
					"password": "password"
				},
				"allow_prepaid": true,
				"accepted_payment_methods": ["Visa", "Mastercard", "American Express", "LOCAL CARD"],
				"customer_service": {
					"email": "customer.service@mid.com",
					"url": "http://mid.com",
					"description": "Some string here..."
				},
				"created_at": "2017-04-06T18:40:41.405Z",
				"updated_at": "2017-04-06T18:41:12.521Z"
			},
			{
				"id": "79189a4a-ed89-4742-aa96-afcd7f6c08fb",
				"account": "d3fa3bf3-7824-49f4-8261-87674482bf1c",
				"name": "NMI Account 2",
				"processor": {
					"name": "NMA"
				},
				"processing": {
					"monthly_cap": 1000000000.00,
					"discount_rate": 0.9,
					"transaction_fee": 0.06,
					"reserve_rate": 0.5,
					"maximum_chargeback_ratio": 0.17,
					"transaction_counts": {
						"daily": 1000000,
						"monthly": 1000000,
						"weekly": 1000000
					}
				},
				"enabled": true,
				"gateway": {
					"type": "NMI",
					"name": "NMI",
					"username": "demo",
					"password": "password"
				},
				"allow_prepaid": true,
				"accepted_payment_methods": ["Visa", "Mastercard", "American Express", "LOCAL CARD"],
				"customer_service": {
					"email": "customer.service@mid.com",
					"url": "http://mid.com",
					"description": "Some string here..."
				},
				"created_at": "2017-04-06T18:40:41.405Z",
				"updated_at": "2017-04-06T18:41:12.521Z"
			}];


		const group = {
			"id": "927b4f7c-b0e9-4ddb-a05c-ba81d2d663d3",
			"name": "Seed merchant provider group",
			"account": "d3fa3bf3-7824-49f4-8261-87674482bf1c",
			"merchantproviders": [
				{
					"id": "6c40761d-8919-4ad6-884d-6a46a776cfb9",
					"distribution": 0.75
				},
				{
					"id": "79189a4a-ed89-4742-aa96-afcd7f6c08fb",
					"distribution": 0.25
				}
			],
			"created_at": "2017-04-06T18:40:41.405Z",
			"updated_at": "2017-04-06T18:41:12.521Z"
		};

		group.summary = {
			month: {
				sum: 10000
			}
		};

		providers.forEach(p => {
			p.summary = {
				summary: {
					thismonth: {
						amount: 10001,
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
			}
		});

		const parameters = {
			merchant_providers: providers,
			merchantprovidergroup: group,
			amount: 100
		};

		const filtered = await filter.filter(parameters);

		console.log(`Before ${providers.map(p => p.id)}, after ${filtered.id}`);

	});


});
