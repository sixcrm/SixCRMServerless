const td = require('testdouble');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const {expect} = chai;

let RebillCreator, rebillCreator;
let RebillController, SessionController, getProductScheduleService;

describe('RebillCreator', () => {
	beforeEach(() => {
		RebillController = td.replace('../../../../../../controllers/entities/Rebill');
		SessionController = td.replace('../../../../../../controllers/entities/Session');
		({ getProductScheduleService } = td.replace('@6crm/sixcrm-product-setup'));

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
			let productSchedule, rebill_prototype, rebill, session;
			beforeEach(() => {
				const product = {
					id: 'd3294914-42ed-40fd-9abe-a4bfbc57d970',
					name: 'Intelligent Plastic Table',
					price: 30,
					shipping_price: 0,
					account_id: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
					created_at: '2018-01-01T00:00:01.000Z',
					updated_at: '2018-01-01T00:00:01.000Z'
				};

				productSchedule = {
					id: 'c3a5d4d2-10f2-44a8-adff-00ca81eb8433',
					name: 'Intelligent Plastic Table Schedule',
					account_id: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
					created_at: '2018-01-01T00:00:01.000Z',
					updated_at: '2018-01-01T00:00:01.000Z',
					merchant_provider_group_id: '27e90ee3-651d-4b1b-8989-0826c91f38bc',
					requires_confirmation: false,
					cycles: [{
						id: '0e5cc5dc-738d-4c1f-bd87-a27ad7cc5b17',
						length: { days: 30 },
						position: 1,
						next_position: 1,
						price: 30,
						shipping_price: 0,
						cycle_products: [{
							product,
							is_shipping: true,
							position: 1,
							quantity: 1
						}]
					}]
				};

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
						product_schedules: [{
							product_schedule: productSchedule,
							quantity: 1
						}]
					},
					completed: true,
					created_at: '2018-01-01T00:00:01.000Z',
					updated_at: '2018-01-01T00:00:01.000Z'
				};

				rebill_prototype = {
					account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
					parentsession: 'c6e9661d-9fb3-4b77-bb8e-78bbf447a599',
					products: [
						{
							product: {
								id: 'd3294914-42ed-40fd-9abe-a4bfbc57d970',
								name: 'Intelligent Plastic Table',
							},
							is_shipping: true,
							position: 1,
							quantity: 1
						}
					],
					amount: 30,
					product_schedules: [
						'c3a5d4d2-10f2-44a8-adff-00ca81eb8433'
					]
				};

			});

			it('does not rebill if session is concluded', async () => {
				session.concluded = true;
				td.when(getProductScheduleService()).thenReturn({
					get() {
						return productSchedule;
					}
				});
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
				td.when(getProductScheduleService()).thenReturn({
					get() {
						return productSchedule;
					}
				});
				const result = await rebillCreator.createRebill({session, day: 0});
				td.verify(RebillController.prototype.create(td.matchers.anything()), {times: 0});
				expect(result).to.equal('CANCELLED');
			});

			// TODO confirmation required test? probably wait

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

				it('creates rebill from a hydrated product schedule', async () => {
					td.when(
						RebillController.prototype.create({ entity: rebill_prototype })
					).thenResolve(rebill);
					td.when(getProductScheduleService()).thenReturn({
						get() {
							return productSchedule;
						}
					});
					const result = await rebillCreator.createRebill({
						session,
						day: -1,
						product_schedules: session.watermark.product_schedules
					});
					expect(result).to.deep.equal(rebill);
				});

				it('creates rebill from a product schedule ID', async () => {
					const hydratedProductSchedule = {
						...productSchedule,
						cycles: productSchedule.cycles.map(cycle => ({
							...cycle,
							price: '30.00',
							shipping_price: '0.00'
						}))
					};
					productSchedule = {
						...hydratedProductSchedule,
						cycles: hydratedProductSchedule.cycles.map(cycle => ({
							...cycle,
							cycle_products: cycle.cycle_products.map(cycle_product => ({
								...cycle_product,
								product: {
									id: 'd3294914-42ed-40fd-9abe-a4bfbc57d970',
									name: 'Intelligent Plastic Table'
								}
							}))
						}))
					};
					td.when(
						RebillController.prototype.create({ entity: rebill_prototype })
					).thenResolve(rebill);
					td.when(getProductScheduleService()).thenReturn({
						get() {
							return hydratedProductSchedule;
						}
					});
					const product_schedules = session.watermark.product_schedules.map(
						({
							quantity,
							product_schedule: { id }
						}) => ({
							quantity,
							product_schedule: id
						})
					);

					const result = await rebillCreator.createRebill({
						session,
						day: -1,
						product_schedules
					});
					expect(result).to.deep.equal(rebill);
					expect(product_schedules[0]).to.deep.equal({
						quantity: 1,
						product_schedule: productSchedule
					});
				});

				it('throws an error when no schedules provided', async () => {
					expect(rebillCreator.createRebill({session, day: -1})).to.eventually.be.rejected;
				});

				it('does not rebill if session is incomplete', async () => {
					session.completed = false;
					td.when(getProductScheduleService()).thenReturn({
						get() {
							return productSchedule;
						}
					});
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
					td.when(SessionController.prototype.listRebills(session)).thenResolve([previous_rebill]);
				});

				it('creates rebill', async () => {
					td.when(RebillController.prototype.create({entity: rebill_prototype})).thenResolve(rebill);
					td.when(getProductScheduleService()).thenReturn({
						get() {
							return productSchedule;
						}
					});
					const result = await rebillCreator.createRebill({session, day: 0});
					expect(result).to.deep.equal(rebill);
				});

				it('creates a monthly rebill', async () => {
					productSchedule.cycles[0].length = { months: 1 };
					rebill_prototype.bill_at = '2018-02-01T00:00:01.000Z';
					td.when(RebillController.prototype.create({entity: rebill_prototype})).thenResolve(rebill);
					td.when(getProductScheduleService()).thenReturn({
						get() {
							return productSchedule;
						}
					});
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
