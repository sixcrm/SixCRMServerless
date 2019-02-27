const td = require('testdouble');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const {expect} = chai;

let RebillCreator, rebillCreator;
let AnalyticsEvent, MerchantProviderController, ProductScheduleController, ProductScheduleHelperController, RebillController, SessionController;

describe('RebillCreator', () => {
	beforeEach(() => {
		AnalyticsEvent = td.replace('../../../../../../controllers/helpers/analytics/analytics-event');
		MerchantProviderController = td.replace('../../../../../../controllers/entities/MerchantProvider');
		ProductScheduleController = td.replace('../../../../../../controllers/entities/ProductSchedule');
		ProductScheduleHelperController = td.replace('../../../../../../controllers/helpers/entities/productschedule/ProductSchedule');
		RebillController = td.replace('../../../../../../controllers/entities/Rebill');
		SessionController = td.replace('../../../../../../controllers/entities/Session');

		RebillCreator = require('../../../../../../controllers/helpers/entities/rebill/RebillCreator');
		rebillCreator = new RebillCreator();
	});

	afterEach(() => {
		td.reset();
	});

	describe('createRebill', () => {
		context('straight sale session', () => {
			let rebill_prototype, rebill, session, product_groups;
			beforeEach(() => {
				session = {
					id: 'c6e9661d-9fb3-4b77-bb8e-78bbf447a599',
					account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
					alias: 'SM8YQXNRSS',
					customer: '744ad1c4-b31f-4c8e-b66f-1c9b41035330',
					campaign: '667e17c9-1a00-46d9-8e22-bcc04d23c1ff',
					products: [
						'd3294914-42ed-40fd-9abe-a4bfbc57d970',
					],
					watermark: {
						products: [{
							product: {
								id: 'd3294914-42ed-40fd-9abe-a4bfbc57d970',
								account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
								name: 'URKALXXQ8JZ7BMG2YXZT',
								default_price: 9.99,
								created_at: '2018-01-01T00:00:01.000Z',
								updated_at: '2018-01-01T00:00:01.000Z'
							},
							amount: 9.99,
							quantity: 1
						}]
					},
					completed: true,
					created_at: '2018-01-01T00:00:01.000Z',
					updated_at: '2018-01-01T00:00:01.000Z'
				};
				product_groups = session.watermark.products;

				rebill_prototype = {
					account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
					parentsession: 'c6e9661d-9fb3-4b77-bb8e-78bbf447a599',
					products: [
						{
							product: {
								id: 'd3294914-42ed-40fd-9abe-a4bfbc57d970',
								account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
								name: 'URKALXXQ8JZ7BMG2YXZT',
								default_price: 9.99,
								created_at: '2018-01-01T00:00:01.000Z',
								updated_at: '2018-01-01T00:00:01.000Z'
							},
							amount: 9.99,
							quantity: 1
						}
					],
					amount: 9.99,
					cycle: 0,
					bill_at: '2018-01-01T00:00:01.000Z',
					processing: true
				};

				rebill = Object.assign({}, rebill_prototype, {
					id: '6b82508c-a334-4cfe-892a-fdaaec925122',
					created_at: '2018-01-01T00:00:01.000Z',
					updated_at: '2018-01-01T00:00:01.000Z'
				});

				td.when(SessionController.prototype.listRebills(session)).thenResolve(null);
			});

			it('creates rebill', async () => {
				td.when(RebillController.prototype.create({entity: rebill_prototype})).thenResolve(rebill);
				const result = await rebillCreator.createRebill({session, day: -1, products: product_groups});
				expect(result).to.deep.equal(rebill);
			});

			it('throws an error when no products provided', async () => {
				expect(rebillCreator.createRebill({session, day: -1})).to.eventually.be.rejected;
			});

			it('does not create recurring rebill', async () => {
				const result = await rebillCreator.createRebill({session, day: 0, products: product_groups});
				td.verify(RebillController.prototype.create(td.matchers.anything()), {times: 0});
				expect(result).to.equal('CONCLUDE');
			});
		});

		context('subscription session', () => {
			let merchant_provider, product_schedule_groups, product_schedule, rebill_prototype, rebill, schedule, session;
			beforeEach(() => {
				session = {
					id: 'c6e9661d-9fb3-4b77-bb8e-78bbf447a599',
					account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
					alias: 'SM8YQXNRSS',
					customer: '744ad1c4-b31f-4c8e-b66f-1c9b41035330',
					campaign: '667e17c9-1a00-46d9-8e22-bcc04d23c1ff',
					product_schedules: [
						'c3a5d4d2-10f2-44a8-adff-00ca81eb8433'
					],
					watermark: {
						product_schedules: [
							{
								product_schedule: {
									id: 'c3a5d4d2-10f2-44a8-adff-00ca81eb8433',
									name: 'KULYGVHVQHQUQW3HTHUL',
									account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
									merchantprovidergroup: '27e90ee3-651d-4b1b-8989-0826c91f38bc',
									schedule: [
										{
											product: {
												id: 'd3294914-42ed-40fd-9abe-a4bfbc57d970',
												account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
												name: 'URKALXXQ8JZ7BMG2YXZT',
												default_price: 9.99,
												created_at: '2018-01-01T00:00:01.000Z',
												updated_at: '2018-01-01T00:00:01.000Z'
											},
											price: 9.99,
											start: 0,
											period: 30
										}
									],
									created_at: '2018-01-01T00:00:01.000Z',
									updated_at: '2018-01-01T00:00:01.000Z'
								},
								quantity: 1
							}
						]
					},
					completed: true,
					created_at: '2018-01-01T00:00:01.000Z',
					updated_at: '2018-01-01T00:00:01.000Z'
				};
				product_schedule_groups = session.watermark.product_schedules;
				product_schedule = product_schedule_groups[0].product_schedule;
				schedule = product_schedule.schedule[0];

				rebill_prototype = {
					account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
					parentsession: 'c6e9661d-9fb3-4b77-bb8e-78bbf447a599',
					products: [
						{
							product: {
								id: 'd3294914-42ed-40fd-9abe-a4bfbc57d970',
								account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
								name: 'URKALXXQ8JZ7BMG2YXZT',
								default_price: 9.99,
								created_at: '2018-01-01T00:00:01.000Z',
								updated_at: '2018-01-01T00:00:01.000Z'
							},
							amount: 9.99,
							quantity: 1
						}
					],
					amount: 9.99,
					product_schedules: [
						'c3a5d4d2-10f2-44a8-adff-00ca81eb8433'
					]
				};

				td.when(ProductScheduleController.prototype.getProducts(td.matchers.anything())).thenResolve({products: []});
				td.when(ProductScheduleHelperController.prototype.marryProductsToSchedule({product_schedule: td.matchers.anything(), products: []})).thenDo(({product_schedule}) => product_schedule);
				td.when(ProductScheduleHelperController.prototype.getNextScheduleElementStartDayNumber({day: -1, product_schedule})).thenReturn(0);
				td.when(ProductScheduleHelperController.prototype.getNextScheduleElementStartDayNumber({day: 0, product_schedule})).thenReturn(30);
				td.when(ProductScheduleHelperController.prototype.getScheduleElementsOnDayInSchedule({start_date: '2018-01-01T00:00:01.000Z', day: td.matchers.isA(Number), product_schedule})).thenReturn(product_schedule.schedule);
			});

			it('does not rebill if session is concluded', async () => {
				session.concluded = true;
				const result = await rebillCreator.createRebill({session, day: 0});
				td.verify(RebillController.prototype.create(td.matchers.anything()), {times: 0});
				expect(result).to.equal('CONCLUDED');
			});

			it('does not rebill if session is cancelled', async () => {
				session.cancelled = {
					cancelled: true,
					cancelled_by: 'foo@sixcrm.com',
					cancelled_at: '2018-01-01T00:00:01.000Z'
				};
				const result = await rebillCreator.createRebill({session, day: 0});
				td.verify(RebillController.prototype.create(td.matchers.anything()), {times: 0});
				expect(result).to.equal('CANCELLED');
			});

			context('initial order', () => {
				beforeEach(() => {
					Object.assign(rebill_prototype, {
						cycle: 0,
						bill_at: '2018-01-01T00:00:01.000Z',
						processing: true
					});
					rebill = Object.assign({}, rebill_prototype, {
						id: '6b82508c-a334-4cfe-892a-fdaaec925122',
						created_at: '2018-01-01T00:00:01.000Z',
						updated_at: '2018-01-01T00:00:01.000Z'
					});
					td.when(SessionController.prototype.listRebills(session)).thenResolve(null);
				});

				it('creates rebill', async () => {
					td.when(RebillController.prototype.create({entity: rebill_prototype})).thenResolve(rebill);
					const result = await rebillCreator.createRebill({session, day: -1, product_schedules: product_schedule_groups});
					expect(result).to.deep.equal(rebill);
				});

				it('throws an error when no schedules provided', async () => {
					expect(rebillCreator.createRebill({session, day: -1})).to.eventually.be.rejected;
				});

				it('does not rebill if session is incomplete', async () => {
					session.completed = false;
					const result = await rebillCreator.createRebill({session, day: 0});
					td.verify(RebillController.prototype.create(td.matchers.anything()), {times: 0});
					expect(result).to.equal('INCOMPLETE');
				});
			});

			context('recurring cycles', () => {
				let previous_rebill;
				beforeEach(() => {
					Object.assign(rebill_prototype, {
						cycle: 1,
						bill_at: '2018-01-31T00:00:01.000Z'
					});
					rebill = Object.assign({}, rebill_prototype, {
						id: '6b82508c-a334-4cfe-892a-fdaaec925122',
						merchant_provider: 'd3ebdbef-982c-4061-bcfe-58c380982285',
						alias: 'R1F174PWZS',
						created_at: '2018-01-01T00:00:01.000Z',
						updated_at: '2018-01-01T00:00:01.000Z'
					});
					previous_rebill = Object.assign({}, rebill_prototype, {
						id: '6b82508c-a334-4cfe-892a-fdaaec925122',
						cycle: 0,
						processing: true,
						bill_at: '2018-01-01T00:00:01.000Z',
						created_at: '2018-01-01T00:00:01.000Z',
						updated_at: '2018-01-01T00:00:01.000Z',
					});
					merchant_provider = {
						'id': '4e0142df-3f91-47ab-9a86-b7de1fd5ec58',
						'account': 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
						'name': 'My Merchant',
						'merchantproviders': [
							{
								'id': 'bacf41cc-30c0-4327-a085-b77be9c2105b',
								'distribution': 0.12
							},
							{
								'id': '48302fb6-c764-4dd1-b6b2-1dce747a0809',
								'distribution': 0.21
							}
						],
						'created_at': '2018-10-09T22:33:28.523Z',
						'updated_at': '2018-10-09T22:33:28.523Z'
					};
					td.when(SessionController.prototype.listRebills(session)).thenResolve([previous_rebill]);
					td.when(ProductScheduleController.prototype.get({id: product_schedule.id})).thenResolve(product_schedule);
					td.when(MerchantProviderController.prototype.get({id: rebill.merchant_provider})).thenResolve(merchant_provider);
				});

				it('creates rebill', async () => {
					td.when(RebillController.prototype.create({entity: rebill_prototype})).thenResolve(rebill);
					const result = await rebillCreator.createRebill({session, day: 0});
					expect(result).to.deep.equal(rebill);
				});
			});
		});
	});

	describe('createRebillPrototype', () => {
		let session;
		beforeEach(() => {
			session = {
				id: 'c6e9661d-9fb3-4b77-bb8e-78bbf447a599',
				account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
			};
		});

		it('returns a rebill prototype', () => {
			const rebill_prototype = rebillCreator.createRebillPrototype({
				session,
				transaction_products: ['d3294914-42ed-40fd-9abe-a4bfbc57d970'],
				bill_at: '2018-01-01T00:00:01.000Z',
				amount: '9.99',
				cycle: 1
			});
			expect(rebill_prototype).to.deep.equal({
				account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
				parentsession: 'c6e9661d-9fb3-4b77-bb8e-78bbf447a599',
				products: ['d3294914-42ed-40fd-9abe-a4bfbc57d970'],
				bill_at: '2018-01-01T00:00:01.000Z',
				amount: '9.99',
				cycle: 1
			});
		});

		it('adds optional fields if present', () => {
			const rebill_prototype = rebillCreator.createRebillPrototype({
				session,
				transaction_products: ['d3294914-42ed-40fd-9abe-a4bfbc57d970'],
				bill_at: '2018-01-01T00:00:01.000Z',
				amount: '9.99',
				cycle: 1,
				merchant_provider: '23a0a0c1-9fc9-4442-b1b1-84c8e5578c3d',
				merchant_provider_selections: [{
					merchant_provider: '23a0a0c1-9fc9-4442-b1b1-84c8e5578c3d',
					product: 'd3294914-42ed-40fd-9abe-a4bfbc57d970'
				}],
				product_schedules: ['c3a5d4d2-10f2-44a8-adff-00ca81eb8433']
			});
			expect(rebill_prototype).to.deep.equal({
				account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
				parentsession: 'c6e9661d-9fb3-4b77-bb8e-78bbf447a599',
				products: ['d3294914-42ed-40fd-9abe-a4bfbc57d970'],
				bill_at: '2018-01-01T00:00:01.000Z',
				amount: '9.99',
				cycle: 1,
				merchant_provider: '23a0a0c1-9fc9-4442-b1b1-84c8e5578c3d',
				merchant_provider_selections: [{
					merchant_provider: '23a0a0c1-9fc9-4442-b1b1-84c8e5578c3d',
					product: 'd3294914-42ed-40fd-9abe-a4bfbc57d970'
				}],
				product_schedules: ['c3a5d4d2-10f2-44a8-adff-00ca81eb8433']
			});
		});
	});
});
