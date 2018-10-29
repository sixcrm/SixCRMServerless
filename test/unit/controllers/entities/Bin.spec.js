let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

describe('controllers/entities/Bin.js', () => {
	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: true,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('getCreditCard', () => {
		it('successfully retrieves credit card propetires from bin', () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			//Technical Debt: this could be expanded to mock entities
			let mockedCreditCardProperties = {
				info: '1.800.732.9194 or 1.800.681.2803 or 888.801.3723 or 757.677.4701 or www.bankofamerica.com',
				bank: 'BANK OF AMERICA N.A.',
				binnumber: 488893,
				level: 'CLASSIC',
				country3_iso: '840',
				brand: 'VISA',
				webpage: 'www.bankofamerica.com',
				country: 'UNITED STATES',
				phone: '800-824-5895',
				country2_iso: 'USA',
				type: 'CREDIT',
				country_iso: 'US'
			}

			let binnumber = 411111;

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({ Items: [mockedCreditCardProperties] });
				}
			});

			const BinController = global.SixCRM.routes.include('controllers', 'entities/Bin.js');
			const binController = new BinController();


			return binController.getCreditCardProperties({ binnumber: binnumber }).then((result) => {
				expect(result).to.equal(mockedCreditCardProperties);
			});
		});
	});
});
