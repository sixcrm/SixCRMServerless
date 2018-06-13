

const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidRebill(id){
	return MockEntities.getValidRebill(id);
}

function getValidRebillPrototype(){

	let rebill = MockEntities.getValidRebill();

	delete rebill.id;
	delete rebill.created_at;
	delete rebill.updated_at;
	delete rebill.account;

	return rebill;

}

function getValidBillDate(){
	return timestamp.getISO8601();
}

function getValidSession(id){
	return MockEntities.getValidSession(id)
}

function getValidProduct(id){
	return MockEntities.getValidProduct(id);
}

function getValidProductSchedule(id){
	return MockEntities.getValidProductSchedule(id);
}

function getValidProductSchedules(ids){

	ids = (!_.isUndefined(ids) && !_.isNull(ids))?ids:[uuidV4(),uuidV4()];

	return arrayutilities.map(ids, id => getValidProductSchedule(id));

}

function getValidProductGroup(product, quantity, price) {
	return MockEntities.getValidProductGroup(product, quantity, price)
}

function getValidSchedule(id) {
	return MockEntities.getValidSchedule(id)
}

function getValidProductScheduleGroups(ids, expanded) {
	return MockEntities.getValidProductScheduleGroups(ids, expanded)
}

describe('/helpers/entities/Rebill.js', () => {
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

		it('successfully calls the constructor', () => {
			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			expect(objectutilities.getClassName(rebillCreatorHelper)).to.equal('RebillCreatorHelper');
		});

	});

	describe('setParameters', () => {

		it('successfully sets required parameters', () => {

			//required
			let session = getValidSession();

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.setParameters({argumentation: {session: session}, action: 'createRebill'}).then(() => {

				expect(rebillCreatorHelper.parameters.store['session']).to.equal(session);

			});

		});

		it('successfully sets optional parameters', () => {

			//required
			let session = getValidSession();

			let day = 2;

			let product_schedules = getValidProductSchedules();

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.setParameters({argumentation: {session: session, day: day, product_schedules: product_schedules}, action: 'createRebill'}).then(() => {

				expect(rebillCreatorHelper.parameters.store['session']).to.equal(session);
				expect(rebillCreatorHelper.parameters.store['day']).to.equal(day);
				expect(rebillCreatorHelper.parameters.store['productschedules']).to.equal(product_schedules);

			});

		});

	});

	describe('hydrateArguments', () => {

		it('successfully hydrates the arguments when all arguments are specified', () => {

			let session = getValidSession();

			let product_schedules = getValidProductSchedules();

			let product_group = getValidProductGroup();

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('session', session);
			rebillCreatorHelper.parameters.set('day', 0);
			rebillCreatorHelper.parameters.set('products', [product_group]);
			rebillCreatorHelper.parameters.set('productschedules', product_schedules);

			expect(rebillCreatorHelper.hydrateArguments()).to.equal(true);
		});

		it('successfully hydrates the arguments when day is not already set', () => {

			let session = getValidSession();

			let product_schedules = getValidProductSchedules();

			let product_group = getValidProductGroup();

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('session', session);
			rebillCreatorHelper.parameters.set('products', [product_group]);
			rebillCreatorHelper.parameters.set('productschedules', product_schedules);

			expect(rebillCreatorHelper.hydrateArguments()).to.equal(true);
			expect(rebillCreatorHelper.parameters.store['day']).to.equal(0);
		});

		it('successfully hydrates the arguments when product schedules are not already set', () => {

			let session = getValidSession();

			let product_group = getValidProductGroup();

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('session', session);
			rebillCreatorHelper.parameters.set('day', 0);
			rebillCreatorHelper.parameters.set('products', [product_group]);

			expect(rebillCreatorHelper.hydrateArguments()).to.equal(true);
			expect(rebillCreatorHelper.parameters.store['productschedules']).to.deep.equal(session.watermark.product_schedules);
		});

		it('does not set product schedules when day is a negative number', () => {

			let session = getValidSession();

			let product_group = getValidProductGroup();

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('session', session);
			rebillCreatorHelper.parameters.set('day', -1);
			rebillCreatorHelper.parameters.set('products', [product_group]);

			expect(rebillCreatorHelper.hydrateArguments()).to.equal(true);
			expect(rebillCreatorHelper.parameters.store['productschedules']).to.be.undefined;
		});

		it('throws error when there are no products or product schedules to be added to the rebill', () => {

			let session = getValidSession();

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('session', session);
			rebillCreatorHelper.parameters.set('day', -1);

			try {
				rebillCreatorHelper.hydrateArguments()
			} catch (error) {
				expect(error.message).to.deep.equal('[500] Nothing to add to the rebill.');
			}
		});

	});


	describe('validateArguments', () => {

		it('successfully validates a session productschedule pair', () => {

			let session = getValidSession();
			let product_schedules = [getValidProductSchedule()];

			session.product_schedules = arrayutilities.map(product_schedules, product_schedule => product_schedule.id);

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('session', session);
			rebillCreatorHelper.parameters.set('productschedules', product_schedules);
			rebillCreatorHelper.parameters.set('day', 1);

			return rebillCreatorHelper.validateArguments().then(result => {
				expect(result).to.equal(true);
			})

		});

		it('successfully returns an error for a productschedule pair which are not associated', () => {

			let session = getValidSession();

			session.product_schedules = [];

			let product_schedules = [getValidProductSchedule()];

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('day', 1);
			rebillCreatorHelper.parameters.set('session', session);
			rebillCreatorHelper.parameters.set('productschedules', product_schedules);

			try{
				rebillCreatorHelper.validateArguments();
			}catch(error){
				expect(error.message).to.have.string('The specified product schedule is not contained in the session object');
			}

		});

		it('throws an error when the schedule elements have inappropriate start and end days', () => {

			let normalized_product_schedules = [{
				quantity:1,
				product_schedule:{
					schedule:[
						{
							product:{
								id:"6c6ec904-5315-4214-a057-79a7ff308cde",
								name:"Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
							},
							price:1.00,
							start:0,
							end:0,
							period:14
						},
						{
							product:{
								id:"92bd4679-8fb5-47ff-93f5-8679c46bcaad",
								name:"Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
							},
							price:1.00,
							start:0,
							end:0,
							period:14
						}
					]
				}
			}];


			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('normalizedproductschedules', normalized_product_schedules);

			try{
				rebillCreatorHelper.validateArguments();
			}catch(error){
				expect(error.message).to.have.string('A schedule element end can not be less than or equal to a schedule element start');
			}

		});

		it('passes if product dynamic pricing is valid', () => {
			const normalized_products = [{
				quantity: 1,
				price: 9.99,
				product: getValidProduct()
			}];

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				validateDynamicPrice(product, price) {
					expect(product).to.equal(normalized_products[0].product);
					expect(price).to.equal(9.99);
					return true;
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('normalizedproducts', normalized_products);

			return rebillCreatorHelper.validateArguments()
				.then(valid => {
					expect(valid).to.be.true;
				});
		});

		it('passes if no product dynamic pricing set', () => {
			const normalized_products = [{
				quantity: 1,
				product: getValidProduct()
			}];

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('normalizedproducts', normalized_products);

			return rebillCreatorHelper.validateArguments()
				.then(valid => {
					expect(valid).to.be.true;
				});
		});

		it('throws error if product dynamic pricing is invalid', () => {
			const normalized_products = [{
				quantity: 1,
				price: 9.99,
				product: getValidProduct()
			}];

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				validateDynamicPrice(product, price) {
					expect(product).to.equal(normalized_products[0].product);
					expect(price).to.equal(9.99);
					return false;
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('normalizedproducts', normalized_products);

			try {
				rebillCreatorHelper.validateArguments();
			} catch(error) {
				expect(error.message).to.equal('[400] Price must be within product\'s dynamic price range.');
			}
		});

		it('passes if product schedule dynamic pricing is valid', () => {
			const product = getValidProduct();
			let normalized_product_schedules = [{
				quantity:1,
				product_schedule: {
					schedule: [
						{
							product,
							price:9.99,
							start:0,
							end:14,
							period:14
						}
					]
				}
			}];

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				validateDynamicPrice(_product, price) {
					expect(_product).to.equal(product);
					expect(price).to.equal(9.99);
					return true;
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('normalizedproductschedules', normalized_product_schedules);

			return rebillCreatorHelper.validateArguments()
				.then(valid => {
					expect(valid).to.be.true;
				});
		});

		it('throws error if product schedule dynamic pricing is invalid', () => {
			const product = getValidProduct();
			let normalized_product_schedules = [{
				quantity:1,
				product_schedule: {
					schedule: [
						{
							product,
							price:9.99,
							start:0,
							end:14,
							period:14
						}
					]
				}
			}];

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				validateDynamicPrice(_product, price) {
					expect(_product).to.equal(product);
					expect(price).to.equal(9.99);
					return false;
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('normalizedproductschedules', normalized_product_schedules);

			try {
				rebillCreatorHelper.validateArguments();
			} catch(error) {
				expect(error.message).to.equal('[400] Price must be within product\'s dynamic price range.');
			}
		});

	});

	describe('getNextProductScheduleBillDayNumber', () => {

		it('successfully acquires the next product schedule bill day number', () => {

			let product_schedule = getValidProductSchedule();

			product_schedule.schedule = [
				{
					product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
					price:4.99,
					start:0,
					end:14,
					period:14
				},
				{
					product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:14,
					end:28,
					period:14
				},
				{
					product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:28,
					period:28
				}
			];

			let test_cases = [
				{
					day:-1,
					expect:0
				}
			];

			return Promise.all(arrayutilities.map(test_cases, test_case => {

				const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
				let rebillCreatorHelper = new RebillCreatorHelperController();

				rebillCreatorHelper.parameters.set('normalizedproductschedules',[{quantity: 1, product_schedule: product_schedule}]);
				rebillCreatorHelper.parameters.set('day', test_case.day);

				return rebillCreatorHelper.getNextProductScheduleBillDayNumber().then(() => {
					expect(rebillCreatorHelper.parameters.get('nextproductschedulebilldaynumber')).to.equal(test_case.expect);
				});

			}));

		});

		it('successfully acquires the next product schedule bill day number', () => {

			let product_schedule = getValidProductSchedule();

			product_schedule.schedule = [
				{
					product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
					price:4.99,
					start:0,
					end:14,
					period:14
				},
				{
					product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:14,
					end:28,
					period:14
				},
				{
					product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:28,
					period:28
				}
			];

			let test_cases = [
				{
					day:-1,
					expect:0
				},
				{
					day: 0,
					expect:14
				},
				{
					day: 1,
					expect:14
				},
				{
					day: 13,
					expect:14
				},
				{
					day: 14,
					expect:28
				},
				{
					day: 15,
					expect:28
				},
				{
					day: 27,
					expect:28
				},
				{
					day: 28,
					expect:56
				},
				{
					day: 29,
					expect:56
				},
				{
					day: 55,
					expect:56
				},
				{
					day: 56,
					expect:84
				},
				{
					day: 2992,
					expect:2996
				}
			];

			return Promise.all(arrayutilities.map(test_cases, test_case => {

				const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
				let rebillCreatorHelper = new RebillCreatorHelperController();

				rebillCreatorHelper.parameters.set('normalizedproductschedules',[{quantity: 1, product_schedule: product_schedule}]);
				rebillCreatorHelper.parameters.set('day', test_case.day);

				return rebillCreatorHelper.getNextProductScheduleBillDayNumber().then(() => {
					expect(rebillCreatorHelper.parameters.get('nextproductschedulebilldaynumber')).to.equal(test_case.expect);
				});

			}));

		});

		it('successfully acquires the next product schedule bill day number against product schedule with lots of primes', () => {

			let product_schedule = getValidProductSchedules()[1];

			product_schedule.schedule = [
				{
					product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
					price:4.99,
					start:17,
					end:23,
					period:33
				},
				{
					product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:51,
					end:750,
					period:13
				},
				{
					product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:908,
					period:31
				}
			];

			let test_cases = [
				{
					day:-1,
					expect:17
				},
				{
					day: 0,
					expect:17
				},
				{
					day: 1,
					expect:17
				},
				{
					day: 16,
					expect:17
				},
				{
					day: 17,
					expect:51
				},
				{
					day: 22,
					expect:51
				},
				{
					day: 23,
					expect:51
				},
				{
					day: 50,
					expect:51
				},
				{
					day: 51,
					expect:64
				},
				{
					day: 63,
					expect:64
				},
				{
					day: 64,
					expect:77
				},
				{
					day: 65,
					expect:77
				},
				{
					day: 908,
					expect:939
				},
				{
					day: 909,
					expect:939
				},
				{
					day: 938,
					expect:939
				},
				{
					day: 939,
					expect:970
				}
			];

			return Promise.all(arrayutilities.map(test_cases, test_case => {

				const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
				let rebillCreatorHelper = new RebillCreatorHelperController();

				rebillCreatorHelper.parameters.set('normalizedproductschedules',[{quantity: 1, product_schedule: product_schedule}]);
				rebillCreatorHelper.parameters.set('day', test_case.day);

				return rebillCreatorHelper.getNextProductScheduleBillDayNumber().then(() => {

					expect(rebillCreatorHelper.parameters.store['nextproductschedulebilldaynumber']).to.equal(test_case.expect);
				});

			}));

		});

		it('returns true when there are no product schedules and the day is negative number', () => {

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('day', -1);

			return rebillCreatorHelper.getNextProductScheduleBillDayNumber().then((result) => {
				expect(result).to.equal(true);
			});

		});

		it('throws error when there are no normalized product schedules', () => {

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('day', 0);

			try{
				rebillCreatorHelper.getNextProductScheduleBillDayNumber()
			} catch (error) {
				expect(error.message).to.equal('[500] Unrecognized case: day is greater than or equal to 0 but there are no normalized product schedules.');
			}

		});

	});

	describe('getScheduleElementsOnBillDay', () => {

		it('successfully acquires the schedule elements on a bill day', () => {

			let product_schedule = getValidProductSchedule();

			product_schedule.schedule = [
				{
					product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
					price:4.99,
					start:0,
					end:14,
					period:14
				},
				{
					product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:14,
					end:28,
					period:14
				},
				{
					product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:28,
					period:28
				}
			];

			let test_cases = [
				{
					day:0,
					expect:product_schedule.schedule[0]
				},
				{
					day:14,
					expect:product_schedule.schedule[1]
				},
				{
					day:28,
					expect:product_schedule.schedule[2]
				},
				{
					day:56,
					expect:product_schedule.schedule[2]
				},
				{
					day: ((randomutilities.randomInt(200, 455020) * product_schedule.schedule[2].period) + product_schedule.schedule[2].start),
					expect:product_schedule.schedule[2]
				}
			];

			return Promise.all(arrayutilities.map(test_cases, test_case => {

				const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
				let rebillCreatorHelper = new RebillCreatorHelperController();

				rebillCreatorHelper.parameters.set('normalizedproductschedules',[{quantity: 1, product_schedule: product_schedule}]);
				rebillCreatorHelper.parameters.set('nextproductschedulebilldaynumber', test_case.day);

				return rebillCreatorHelper.getScheduleElementsOnBillDay().then(() => {

					expect(rebillCreatorHelper.parameters.store['scheduleelementsonbillday']).to.deep.equal([{quantity: 1, schedule_element: test_case.expect}]);

				});

			}));

		});

		it('handles a non-bill day', () => {

			let product_schedule = getValidProductSchedule();

			product_schedule.schedule = [
				{
					product:"616cc994-9480-4640-b26c-03810a679fe3",
					price:4.99,
					start:17,
					end:23,
					period:33
				},
				{
					product:"be992cea-e4be-4d3e-9afa-8e020340ed16",
					price:34.99,
					start:51,
					end:750,
					period:13
				},
				{
					product:"be992ceb-e4be-4d3e-9afa-8e020340ed16",
					price:34.99,
					start:908,
					period:31
				}
			];

			let test_cases = [
				{
					day:16,
					expect:null
				},
				{
					day:-1,
					expect:null
				},
				{
					day:800,
					expect:null
				}
			];

			return Promise.all(arrayutilities.map(test_cases, test_case => {

				const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
				let rebillCreatorHelper = new RebillCreatorHelperController();

				rebillCreatorHelper.parameters.set('productschedules',[product_schedule]);
				rebillCreatorHelper.parameters.set('nextproductschedulebilldaynumber', test_case.day);

				return rebillCreatorHelper.getScheduleElementsOnBillDay().then(() => {

					let elements = rebillCreatorHelper.parameters.get('scheduleelementsonbillday', {fatal: false});

					expect(elements).to.equal(test_case.expect);

				});

			}));

		});

		it('successfully acquires the schedule elements on a bill day', () => {

			let product_schedule = getValidProductSchedules()[1];

			product_schedule.schedule = [
				{
					product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
					price:4.99,
					start:17,
					end:23,
					period:33
				},
				{
					product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:51,
					end:750,
					period:13
				},
				{
					product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:908,
					period:31
				}
			];

			let test_cases = [
				{
					day:17,
					expect:product_schedule.schedule[0]
				},
				{
					day:51,
					expect:product_schedule.schedule[1]
				},
				{
					day:64,
					expect:product_schedule.schedule[1]
				},
				{
					day: ((randomutilities.randomInt(1, (Math.floor(((product_schedule.schedule[1].end - product_schedule.schedule[1].start) / product_schedule.schedule[1].period))) - 1) * product_schedule.schedule[1].period) + product_schedule.schedule[1].start),
					expect:product_schedule.schedule[1]
				},
				{
					day:908,
					expect:product_schedule.schedule[2]
				},
				{
					day: ((randomutilities.randomInt(200, 455020) * product_schedule.schedule[2].period) + product_schedule.schedule[2].start),
					expect:product_schedule.schedule[2]
				}
			];

			return Promise.all(arrayutilities.map(test_cases, test_case => {

				const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
				let rebillCreatorHelper = new RebillCreatorHelperController();

				rebillCreatorHelper.parameters.set('normalizedproductschedules',[{quantity: 1, product_schedule: product_schedule}]);
				rebillCreatorHelper.parameters.set('nextproductschedulebilldaynumber', test_case.day);

				return rebillCreatorHelper.getScheduleElementsOnBillDay().then(() => {

					expect(rebillCreatorHelper.parameters.store['scheduleelementsonbillday']).to.deep.equal([{quantity: 1, schedule_element: test_case.expect}]);

				});

			}));

		});

	});

	describe('calculateAmount', () => {

		it('successfully calculates the amount from the transaction products', () => {

			let test_cases = [
				{
					transaction_products:[{
						product:getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
						amount: 12.39,
						quantity: 1
					}],
					expect: 12.39
				},
				{
					transaction_products:[{
						product:getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
						amount: 12.39,
						quantity: 1
					},
					{
						product:getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
						amount: 21.67,
						quantity: 1
					}],
					expect: 34.06
				},
				{
					transaction_products:[],
					expect: 0
				},
				{
					transaction_products:[{
						product:getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
						quantity: 1,
						amount: 0.00
					},
					{
						product:getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
						quantity: 1,
						amount: 21.67
					}],
					expect: 21.67
				}
			];

			return Promise.all(arrayutilities.map(test_cases, test_case => {

				const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
				let rebillCreatorHelper = new RebillCreatorHelperController();

				rebillCreatorHelper.parameters.set('transactionproducts', test_case.transaction_products);

				return rebillCreatorHelper.calculateAmount().then(result => {
					expect(result).to.equal(true);
					expect(rebillCreatorHelper.parameters.store['amount']).to.equal(test_case.expect);
				});

			}));

		});

	});

	describe('calculateBillAt', () => {

		it('successfully sets the bill_at property', () => {

			let session = getValidSession();

			session.created_at = '2017-04-06T18:40:41.000Z';

			let test_cases = [
				{
					days: 14,
					expect: '2017-04-20T18:40:41.000Z'
				},
				{
					days: 365,
					expect: '2018-04-06T18:40:41.000Z'
				},
				{
					days: 28,
					expect: '2017-05-04T18:40:41.000Z'
				}
			];

			return Promise.all(arrayutilities.map(test_cases, test_case => {

				const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
				let rebillCreatorHelper = new RebillCreatorHelperController();

				rebillCreatorHelper.parameters.set('session', session);
				rebillCreatorHelper.parameters.set('nextproductschedulebilldaynumber', test_case.days);

				return rebillCreatorHelper.calculateBillAt().then(result => {
					expect(result).to.equal(true);
					expect(rebillCreatorHelper.parameters.get('billdate', {fatal: false})).to.equal(test_case.expect);
				});

			}));

		});

	});

	describe('buildRebillPrototype', () => {

		it('successfully builds a rebill prototype', () => {

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			let normalized_product_schedules = [
				{
					product_schedule: getValidProductSchedule(),
					quantity: 1
				},
				{
					product_schedule: getValidProductSchedule(),
					quantity: 1
				}
			];


			rebillCreatorHelper.parameters.set('transactionproducts', [{
				product: getValidProduct('45f025bb-a9dc-45c7-86d8-d4b7a4443426'),
				amount: 12.99,
				quantity: 1
			}]);

			rebillCreatorHelper.parameters.set('billdate', getValidBillDate());
			rebillCreatorHelper.parameters.set('amount', 12.99);
			rebillCreatorHelper.parameters.set('normalizedproductschedules', normalized_product_schedules);
			rebillCreatorHelper.parameters.set('session', getValidSession());
			rebillCreatorHelper.parameters.set('nextproductschedulebilldaynumber',0);

			return rebillCreatorHelper.buildRebillPrototype().then(result => {
				expect(result).to.equal(true);

				let prospective_rebill_prototype = rebillCreatorHelper.parameters.get('rebillprototype');

				expect(prospective_rebill_prototype).to.have.property('products');
				expect(prospective_rebill_prototype).to.have.property('bill_at');
				expect(prospective_rebill_prototype).to.have.property('amount');
				expect(prospective_rebill_prototype).to.have.property('product_schedules');
				expect(prospective_rebill_prototype).to.have.property('parentsession');

			});

		});

	});

	describe('pushRebill', () => {

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			});
		});

		afterEach(() => {
			mockery.resetCache();
			mockery.deregisterAll();
		});

		it('successfully saves a rebill to the database', () => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
				constructor(){}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('rebillprototype', getValidRebillPrototype());

			return rebillCreatorHelper.pushRebill().then((result) => {
				expect(result).to.equal(true);
				let rebill = rebillCreatorHelper.parameters.get('rebill');

				expect(rebill).to.have.property('id');
				expect(rebill).to.have.property('created_at');
				expect(rebill).to.have.property('updated_at');
				expect(rebill).to.have.property('account');
			})

		});

	});

	describe('returnRebill', () => {
		it('successfully returns a rebill object', () => {
			let rebill = getValidRebill();
			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('rebill', rebill);
			return rebillCreatorHelper.returnRebill().then(result => {
				expect(result).to.deep.equal(rebill);
			});
		});
	});

	describe('acquireRebillProperties', () => {

		it('Successfully acquires rebill properties', () => {

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			let session = getValidSession();

			session.created_at = '2017-04-06T18:40:41.405Z';

			let product_schedule = getValidProductSchedule();

			product_schedule.schedule = [
				{
					product: getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
					price:4.99,
					start:0,
					end:14,
					period:14
				},
				{
					product: getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:14,
					end:28,
					period:14
				},
				{
					product: getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
					price:34.99,
					start:28,
					period:28
				}
			];

			let product_schedules = [{quantity: 1, product_schedule: product_schedule}];

			session.product_schedules = arrayutilities.map(product_schedules, product_schedule_group => product_schedule_group.product_schedule.id);

			rebillCreatorHelper.parameters.set('session', session);
			rebillCreatorHelper.parameters.set('day', -1);
			rebillCreatorHelper.parameters.set('normalizedproductschedules', product_schedules);

			let expected_day_number = 0;
			let expected_schedule_elements = [{quantity: 1, schedule_element: product_schedule.schedule[0]}];
			let expected_transaction_products = [{
				product:product_schedule.schedule[0].product,
				amount:product_schedule.schedule[0].price,
				quantity: 1
			}];
			let expected_amount = product_schedule.schedule[0].price;
			let expected_billdate = '2017-04-06T18:40:41.000Z';

			return rebillCreatorHelper.acquireRebillProperties().then(result => {

				expect(result).to.equal(true);

				let day_number = rebillCreatorHelper.parameters.get('nextproductschedulebilldaynumber');
				let schedule_elements = rebillCreatorHelper.parameters.get('scheduleelementsonbillday');
				let transaction_products = rebillCreatorHelper.parameters.get('transactionproducts');
				let amount = rebillCreatorHelper.parameters.get('amount');
				let billdate = rebillCreatorHelper.parameters.get('billdate');

				expect(day_number).to.equal(expected_day_number);
				expect(schedule_elements).to.deep.equal(expected_schedule_elements);
				expect(transaction_products).to.deep.equal(expected_transaction_products);
				expect(amount).to.equal(expected_amount);
				expect(billdate).to.equal(expected_billdate);

			});

		});

	});

	describe('createRebill', () => {

		let product_schedules = [{quantity: 1, product_schedule: getValidProductSchedule()}];

		product_schedules[0].product_schedule.schedule = [
			{
				product:getValidProduct("616cc994-9480-4640-b26c-03810a679fe3"),
				price:4.99,
				start:0,
				end:14,
				period:14
			},
			{
				product:getValidProduct("be992cea-e4be-4d3e-9afa-8e020340ed16"),
				price:34.99,
				start:14,
				end:28,
				period:14
			},
			{
				product:getValidProduct("be992ceb-e4be-4d3e-9afa-8e020340ed16"),
				price:34.99,
				start:28,
				period:28
			}
		];

		let product_schedule_ids = arrayutilities.map(product_schedules, product_schedule_group => product_schedule_group.product_schedule.id);
		let session = getValidSession();

		session.created_at = '2017-04-06T18:40:41.000Z';
		session.product_schedules = product_schedule_ids;
		delete session.product_schedules;

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			});
		});

		beforeEach(() => {

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
				createINQueryParameters(field_name, in_array) {
					arrayutilities.nonEmpty(in_array, true);
					if(!arrayutilities.assureEntries(in_array, 'string')){
						throw eu.getError('server', 'All entries in the "in_array" must be of type string.');
					}
					let in_object = {};

					arrayutilities.map(in_array, (value) => {
						var in_key = ":"+randomutilities.createRandomString(10);

						while(_.has(in_object, in_key)){
							in_key = ":"+randomutilities.createRandomString(10);
						}
						in_object[in_key.toString()] = value;
					});
					return {
						filter_expression : field_name+" IN ("+Object.keys(in_object).toString()+ ")",
						expression_attribute_values : in_object
					};
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				listProductSchedules() {
					return Promise.resolve({productschedules:product_schedules});
				}
				getResult() {
					return product_schedules;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ProductSchedule.js'), class {
				listProductSchedulesByList({product_schedules}) {
					return Promise.resolve({productschedules:product_schedules});
				}
				getResult() {
					return product_schedules;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			let mock_preindexing_helper = class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

		});

		afterEach(() => {
			//Technical Debt:  This is causing issues when there is no network...
			mockery.resetCache();
			mockery.deregisterAll();
		});

		it('successfully creates a rebill for 0th day', () => {

			let day = -1;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				validateDynamicPrice() {
					return true
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			session.product_schedules = [];
			rebillCreatorHelper.parameters.set('session', session);

			return rebillCreatorHelper.createRebill({session: session, day: day, product_schedules: session.watermark.product_schedules}).then(result => {

				delete result.created_at;
				delete result.updated_at;
				delete result.id;

				let amount = 0;

				arrayutilities.map(result.products, product_group => {
					amount += (product_group.quantity * product_group.amount)
				});

				expect(result.amount).to.equal(numberutilities.formatFloat(amount, 2));


				//expect(result).to.deep.equal(expected_rebill);

			});
		});

		it('successfully creates a rebill for 14th day', () => {

			let day = 0;

			let expected_rebill = {
				account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
				amount: product_schedules[0].product_schedule.schedule[1].price,
				bill_at: "2017-04-20T18:40:41.000Z",
				entity_type: "rebill",
				parentsession: session.id,
				product_schedules: [product_schedules[0].product_schedule.id],
				products: [
					{
						product: product_schedules[0].product_schedule.schedule[1].product,
						amount: product_schedules[0].product_schedule.schedule[1].price,
						quantity: 1
					}
				]
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				validateDynamicPrice() {
					return true
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			session.watermark = {product_schedules: product_schedules};

			return rebillCreatorHelper.createRebill({session: session, day: day}).then(result => {

				delete result.alias;
				delete result.created_at;
				delete result.updated_at;
				delete result.id;

				expect(result).to.deep.equal(expected_rebill);

			});
		});

		it('successfully creates a rebill for 28th day', () => {

			let day = 14;

			let expected_rebill = {
				account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
				amount: product_schedules[0].product_schedule.schedule[2].price,
				bill_at: "2017-05-04T18:40:41.000Z",
				entity_type: "rebill",
				parentsession: session.id,
				product_schedules: [product_schedules[0].product_schedule.id],
				products: [
					{
						product: product_schedules[0].product_schedule.schedule[2].product,
						amount: product_schedules[0].product_schedule.schedule[2].price,
						quantity: 1
					}
				]
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				validateDynamicPrice() {
					return true
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.createRebill({session: session, day: day}).then(result => {

				delete result.alias;
				delete result.created_at;
				delete result.updated_at;
				delete result.id;

				expect(result).to.deep.equal(expected_rebill);

			});
		});

		it('successfully creates a rebill for 56th day', () => {

			let day = 28;

			let expected_rebill = {
				account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
				amount: product_schedules[0].product_schedule.schedule[2].price,
				bill_at: "2017-06-01T18:40:41.000Z",
				entity_type: "rebill",
				parentsession: session.id,
				product_schedules: [product_schedules[0].product_schedule.id],
				products: [
					{
						product: product_schedules[0].product_schedule.schedule[2].product,
						amount: product_schedules[0].product_schedule.schedule[2].price,
						quantity: 1
					}
				]
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				validateDynamicPrice() {
					return true
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.createRebill({session: session, day: day}).then(result => {

				delete result.alias;
				delete result.created_at;
				delete result.updated_at;
				delete result.id;

				expect(result).to.deep.equal(expected_rebill);

			});
		});

		it('successfully creates a rebill for 56th day from a non-bill date', () => {

			let day = 29;

			let expected_rebill = {
				account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
				amount: product_schedules[0].product_schedule.schedule[2].price,
				bill_at: "2017-06-01T18:40:41.000Z",
				entity_type: "rebill",
				parentsession: session.id,
				product_schedules: [product_schedules[0].product_schedule.id],
				products: [
					{
						product: product_schedules[0].product_schedule.schedule[2].product,
						amount: product_schedules[0].product_schedule.schedule[2].price,
						quantity: 1
					}
				]
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				validateDynamicPrice() {
					return true
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.createRebill({session: session, day: day}).then(result => {

				delete result.alias;
				delete result.created_at;
				delete result.updated_at;
				delete result.id;

				expect(result).to.deep.equal(expected_rebill);

			});

		});

	});

	describe('createRebill', () => {

		before(() => {
			mockery.enable({
				useCleanCache: true,
				warnOnReplace: false,
				warnOnUnregistered: false
			});
		});

		afterEach(() => {
			//Technical Debt:  This is causing issues when there is no network...
			mockery.resetCache();
			mockery.deregisterAll();
		});

		xit('successfully creates a rebill based off of failing test case', () => {

			let session = {
				"account": "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
				"alias": "SS4AEASQ52",
				"campaign": "71c3cac1-d084-4e12-ac75-cdb28987ae16",
				"completed": false,
				"created_at": "2018-03-08T22:09:49.046Z",
				"customer": "b5be7968-f2b5-4fbe-adbb-185fe2f236b8",
				"id": "f827baa6-0cd3-4645-8d49-e12be6c33fbe",
				"updated_at": "2018-03-08T22:09:55.473Z",
				"watermark": {
					"product_schedules": [
						{
							"product_schedule": {
								"schedule": [
									{
										"period": 14,
										"price": 1,
										"product": {
											"id": "6c6ec904-5315-4214-a057-79a7ff308cde",
											"name": "Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
										},
										"start": 0
									},
									{
										"period": 14,
										"price": 1,
										"product": {
											"id": "92bd4679-8fb5-47ff-93f5-8679c46bcaad",
											"name": "Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
										},
										"start": 0
									}
								]
							},
							"quantity": 1
						}
					]
				}
			};

			let product_schedules = [{
				quantity:1,
				product_schedule:{
					schedule:[
						{
							product:{
								id:"6c6ec904-5315-4214-a057-79a7ff308cde",
								name:"Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
							},
							price:1.00,
							start:0,
							period:14
						},
						{
							product:{
								id:"92bd4679-8fb5-47ff-93f5-8679c46bcaad",
								name:"Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
							},
							price:1.00,
							start:0,
							period:14
						}
					]
				}
			}];

			/*
      mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
        queryRecords() {
          return Promise.resolve([]);
        }
        saveRecord(tableName, entity) {
          return Promise.resolve(entity);
        }
        createINQueryParameters(field_name, in_array) {
          arrayutilities.nonEmpty(in_array, true);
          if(!arrayutilities.assureEntries(in_array, 'string')){
            throw eu.getError('server', 'All entries in the "in_array" must be of type string.');
          }
          let in_object = {};

          arrayutilities.map(in_array, (value) => {
            var in_key = ":"+randomutilities.createRandomString(10);

            while(_.has(in_object, in_key)){
              in_key = ":"+randomutilities.createRandomString(10);
            }
            in_object[in_key.toString()] = value;
          });
          return {
            filter_expression : field_name+" IN ("+Object.keys(in_object).toString()+ ")",
            expression_attribute_values : in_object
          };
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
        listProductSchedules() {
          return Promise.resolve({productschedules:product_schedules});
        }
        getResult() {
          return product_schedules;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities', 'ProductSchedule.js'), class {
        listProductSchedulesByList({product_schedules}) {
          return Promise.resolve({productschedules: product_schedules});
        }
        getResult() {
          return product_schedules;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
        constructor(){

        }
        addToSearchIndex(){
          return Promise.resolve(true);
        }
        removeFromSearchIndex(){
          return Promise.resolve(true);
        }
      });
      */

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'cb4a1482-1093-4d8e-ad09-fdd4d840b497');

			let day = -1;

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.createRebill({session: session, day: day, product_schedules: product_schedules}).then(result => {

				du.info(result);

				delete result.alias;
				delete result.created_at;
				delete result.updated_at;
				delete result.id;

				expect(result.amount).to.equal(2.00);

			});

		});

		it('successfully creates a rebill for odd test case', () => {

			let product_schedules = null;
			let session = getValidSession();

			delete session.product_schedules;

			session.created_at = '2017-04-06T18:40:41.000Z';
			session.watermark = {
				product_schedules:[{
					quantity:1,
					product_schedule:{
						schedule:[
							{
								product:{
									id:"6c6ec904-5315-4214-a057-79a7ff308cde",
									name:"Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb"
								},
								price:1.00,
								start:0,
								period:14
							},
							{
								product:{
									id:"92bd4679-8fb5-47ff-93f5-8679c46bcaad",
									name:"Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb"
								},
								price:1.00,
								start:0,
								period:14
							}
						]
					}
				}]
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
				createINQueryParameters(field_name, in_array) {
					arrayutilities.nonEmpty(in_array, true);
					if(!arrayutilities.assureEntries(in_array, 'string')){
						throw eu.getError('server', 'All entries in the "in_array" must be of type string.');
					}
					let in_object = {};

					arrayutilities.map(in_array, (value) => {
						var in_key = ":"+randomutilities.createRandomString(10);

						while(_.has(in_object, in_key)){
							in_key = ":"+randomutilities.createRandomString(10);
						}
						in_object[in_key.toString()] = value;
					});
					return {
						filter_expression : field_name+" IN ("+Object.keys(in_object).toString()+ ")",
						expression_attribute_values : in_object
					};
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				listProductSchedules() {
					return Promise.resolve({productschedules:product_schedules});
				}
				getResult() {
					return product_schedules;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ProductSchedule.js'), class {
				listProductSchedulesByList({product_schedules}) {
					return Promise.resolve({productschedules: product_schedules});
				}
				getResult() {
					return product_schedules;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				validateDynamicPrice() {
					return true
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let day = -1;

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.createRebill({session: session, day: day, product_schedules: session.watermark.product_schedules}).then(result => {

				delete result.alias;
				delete result.created_at;
				delete result.updated_at;
				delete result.id;

				expect(result.amount).to.equal(2.00);

			});

		});

		it('successfully creates a rebill for 0th day from watermark with overlapping ', () => {

			let product_schedules = null;
			let session = getValidSession();

			delete session.product_schedules;
			session.created_at = '2017-04-06T18:40:41.000Z';
			session.watermark = {
				product_schedules: [
					{
						product_schedule: {
							schedule: [
								{
									period: 14,
									price: 62.35,
									product: {
										id: "92bd4679-8fb5-47ff-93f5-8679c46bcaad",
										name: "Smack Dog - Caribbean Salmon Fusion 1.5 kg/3.30 lb",
										default_price: 62.35
									},
									start: 0
								}
							]
						},
						quantity: 1
					},
					{
						product_schedule: {
							schedule: [
								{
									period: 14,
									price: 101.35,
									product: {
										id: "6c6ec904-5315-4214-a057-79a7ff308cde",
										name: "Smack Dog - Caribbean Salmon Fusion 2.5 kg/5.5 lb",
										default_price: 101.35
									},
									start: 0
								}
							]
						},
						quantity: 1
					}
				],
				products: [
					{
						price: 5.98,
						product: {
							account: "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
							attributes: {
								images: [
									{
										default_image: false,
										path: "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/e023cdccdee2b175edf3a84a4bd0dd96b59b252f.jpg"
									}
								]
							},
							created_at: "2018-02-19T20:08:14.888Z",
							default_price: 5.98,
							description: "120ct Easy Tie Bags",
							fulfillment_provider: "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
							id: "4efa7820-38d4-4643-9745-ba581a665557",
							name: "Bark Dog Waste Bags",
							ship: true,
							shipping_delay: 60,
							sku: "DWB-120",
							updated_at: "2018-02-19T20:12:24.928Z"
						},
						quantity: 1
					},
					{
						price: 15.96,
						product: {
							account: "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
							attributes: {
								images: []
							},
							created_at: "2018-01-25T17:09:37.435Z",
							default_price: 15.96,
							fulfillment_provider: "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
							id: "78c02d93-e9e0-4077-817e-eaf6d3316b10",
							name: "Bully Stick - Steer, 6\"(4 pcs/ 1 pkg)",
							ship: true,
							shipping_delay: 60,
							sku: "EFT BLS-600MC",
							updated_at: "2018-02-22T20:12:02.709Z"
						},
						quantity: 1
					},
					{
						price: 20.97,
						product: {
							account: "cb4a1482-1093-4d8e-ad09-fdd4d840b497",
							attributes: {
								images: [
									{
										default_image: false,
										path: "https://s3.amazonaws.com/sixcrm-production-account-resources/cb4a1482-1093-4d8e-ad09-fdd4d840b497/user/images/5627243dc22fc65b79b19399f0af461b44f479d9.png"
									}
								]
							},
							created_at: "2018-02-19T20:11:31.708Z",
							default_price: 20.97,
							description: "Sheep Ears, Crunchy Spare Ribs, Lamb Puffs ",
							fulfillment_provider: "8c2a7993-56e4-47b1-b20d-29c778b8c2e0",
							id: "ab9aa4d0-0c2e-47f3-a458-b4d0bc8f371e",
							name: "Newts Chews Sampler Pack",
							ship: true,
							shipping_delay: 60,
							sku: "NCNZ-Sampler",
							updated_at: "2018-02-19T20:12:38.246Z"
						},
						quantity: 1
					}
				]
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
				createINQueryParameters(field_name, in_array) {
					arrayutilities.nonEmpty(in_array, true);
					if(!arrayutilities.assureEntries(in_array, 'string')){
						throw eu.getError('server', 'All entries in the "in_array" must be of type string.');
					}
					let in_object = {};

					arrayutilities.map(in_array, (value) => {
						var in_key = ":"+randomutilities.createRandomString(10);

						while(_.has(in_object, in_key)){
							in_key = ":"+randomutilities.createRandomString(10);
						}
						in_object[in_key.toString()] = value;
					});
					return {
						filter_expression : field_name+" IN ("+Object.keys(in_object).toString()+ ")",
						expression_attribute_values : in_object
					};
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				listProductSchedules() {
					return Promise.resolve({productschedules:product_schedules});
				}
				getResult() {
					return product_schedules;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'ProductSchedule.js'), class {
				listProductSchedulesByList({product_schedules}) {
					return Promise.resolve({productschedules: product_schedules});
				}
				getResult() {
					return product_schedules;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
				createActivity() {
					return true;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), class {
				constructor(){

				}
				addToSearchIndex(){
					return Promise.resolve(true);
				}
				removeFromSearchIndex(){
					return Promise.resolve(true);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let day = -1;

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.createRebill({session: session, day: day, product_schedules: session.watermark.product_schedules, products: session.watermark.products}).then(result => {

				delete result.alias;
				delete result.created_at;
				delete result.updated_at;
				delete result.id;

				expect(result.amount).to.equal(206.61);

			});

		});

	});

	describe('normalizeProducts', () => {

		it('successfully normalizes products when product is an id', () => {

			let product_id = uuidV4();

			let product_group = getValidProductGroup(product_id);

			let product = getValidProduct(product_id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				isUUID(id) {
					expect(id).to.equal(product_group.product);
					return true;
				}
				get({id}) {
					expect(id).to.equal(product_group.product);
					return Promise.resolve(product);
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('products', [product_group]);

			return rebillCreatorHelper.normalizeProducts().then((result) => {
				expect(result).to.equal(true);
				expect(rebillCreatorHelper.parameters.store['normalizedproducts']).to.deep.equal([product_group]);
			});
		});

		it('successfully normalizes products when product is an object', () => {

			let product_group = getValidProductGroup();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				isUUID(id) {
					expect(id).not.to.equal(product_group.product.id);
					return false;
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('products', [product_group]);

			return rebillCreatorHelper.normalizeProducts().then((result) => {
				expect(result).to.equal(true);
				expect(rebillCreatorHelper.parameters.store['normalizedproducts']).to.deep.equal([product_group]);
			});
		});

		it('throws error when product with specified id does not exist', () => {

			let product_id = uuidV4();

			let product_group = getValidProductGroup(product_id);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Product.js'), class {
				isUUID(id) {
					expect(id).to.equal(product_group.product);
					return true;
				}
				get({id}) {
					expect(id).to.equal(product_group.product);
					return Promise.resolve(null);
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('products', [product_group]);

			return rebillCreatorHelper.normalizeProducts().catch((error) => {
				expect(error.message).to.equal('[404] Product does not exist: ' + product_group.product);
			});
		});

		it('returns true when products are undefined', () => {

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.normalizeProducts().then((result) => {
				expect(result).to.equal(true);
			});
		});

	});

	describe('getPriceFromProductGroup', () => {

		it('returns price from product group', () => {

			let product_group = getValidProductGroup();

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			expect(rebillCreatorHelper.getPriceFromProductGroup(product_group)).to.equal(product_group.price);
		});

		it('returns default price from product', () => {

			let product_group = getValidProductGroup();

			delete product_group.price;

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			expect(rebillCreatorHelper.getPriceFromProductGroup(product_group)).to.equal(product_group.product.default_price);
		});

		it('throws error when price can not be identified from product nor from product group', () => {

			let product_group = getValidProductGroup();

			delete product_group.price;
			delete product_group.product.default_price;

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			try {
				rebillCreatorHelper.getPriceFromProductGroup(product_group)
			} catch (error) {
				expect(error.message).to.equal('[500] Unable to identify price for product: ' + product_group.product.id);
			}
		});
	});

	describe('addScheduleElementsToTransactionProducts', () => {

		it('successfully adds schedule elements to transaction products', () => {

			let schedule = getValidSchedule();

			let schedule_elements = [{
				quantity: 1,
				schedule_element: schedule[0]
			}];

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('scheduleelementsonbillday', schedule_elements);

			return rebillCreatorHelper.addScheduleElementsToTransactionProducts().then((result) => {
				expect(result).to.equal(true);
				expect(rebillCreatorHelper.parameters.store['transactionproducts']).to.deep.equal([{
					product: schedule[0].product,
					amount: schedule[0].price,
					quantity: schedule_elements[0].quantity
				}]);
			});
		});

		it('returns false when there are no schedule elements on bill day', () => {

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			const rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.addScheduleElementsToTransactionProducts().then((result) => {
				expect(result).to.equal(false);
			});
		});
	});

	describe('normalizeProductSchedules', () => {

		it('successfully normalizes product schedules', () => {

			let product_schedule_groups = getValidProductScheduleGroups([uuidV4()]);

			let product_schedule = getValidProductSchedules([product_schedule_groups[0].product_schedule]);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/productschedule/ProductSchedule.js'), class {
				getHydrated({id}) {
					expect(id).to.equal(product_schedule_groups[0].product_schedule);

					return Promise.resolve(product_schedule[0]);
				}
			});

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('productschedules', product_schedule_groups);

			return rebillCreatorHelper.normalizeProductSchedules().then((result) => {
				expect(result).to.equal(true);
				expect(rebillCreatorHelper.parameters.store['normalizedproductschedules']).to.deep.equal(product_schedule_groups);
			});
		});

		it('successfully normalizes product schedules when product schedules are an object', () => {

			let product_schedule_groups = getValidProductScheduleGroups([uuidV4()], true);

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			rebillCreatorHelper.parameters.set('productschedules', product_schedule_groups);

			return rebillCreatorHelper.normalizeProductSchedules().then((result) => {
				expect(result).to.equal(true);
				expect(rebillCreatorHelper.parameters.store['normalizedproductschedules']).to.deep.equal(product_schedule_groups);
			});
		});

		it('returns true when product schedules are not set', () => {

			const RebillCreatorHelperController = global.SixCRM.routes.include('helpers', 'entities/rebill/RebillCreator.js');
			let rebillCreatorHelper = new RebillCreatorHelperController();

			return rebillCreatorHelper.normalizeProductSchedules().then((result) => {
				expect(result).to.equal(true);
			});
		});
	});

	/*
	shouldRebill(){

		du.debug('Should Rebill');

		const session = this.parameters.get('session', {fatal: false});
		const day = this.parameters.get('day', {fatal: false});

		if(_.has(session, 'concluded') && session.concluded == true){
			du.warning('Session concluded, do not rebill');
			throw eu.getError('control', 'CONCLUDED');
		}

		if(_.has(session, 'cancelled') && _.has(session.cancelled, 'cancelled') && session.cancelled.cancelled == true){
			du.warning('Session cancelled, do not rebill');
			throw eu.getError('control', 'CANCELLED');
		}

		if(day < 0){
			return;
		}

		if(!_.has(session, 'completed') || session.completed !== true){
			du.warning('Session is not completed, do not rebill');
			throw eu.getError('control', 'INCOMPLETE');
		}

		const product_schedules = this.parameters.get('normalizedproductschedules', {fatal: false});

		if(!_.isArray(product_schedules) || !arrayutilities.nonEmpty(product_schedules)){
			du.warning('No product schedules, do not rebill');
			throw eu.getError('control', 'CONCLUDE');
		}

	}
	*/
});
