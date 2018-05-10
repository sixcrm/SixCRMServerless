
const mockery = require('mockery');
let chai = require('chai');
const expect = chai.expect;
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidToken(){

	//Will need to be updated when stripe tokens are included...
	return randomutilities.createRandomString(20);

}

function getValidBill(){
	return MockEntities.getValidBill();
}

describe('helpers/entities/bill/Bill.js', () => {

	before(() => {

		PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

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

			const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');
			let billHelperController = new BillHelperController();

			expect(objectutilities.getClassName(billHelperController)).to.equal('BillHelperController');

		});

	});

	describe('acquireBill', () => {

		it('successfully acquires a bill', () => {

			let bill =  getValidBill();

			let mock_bill = class {
				constructor(){}

				get() {
					return Promise.resolve(bill);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Bill.js'), mock_bill);

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');
			let billHelperController = new BillHelperController();

			billHelperController.parameters.set('billid', bill.id);

			return billHelperController.acquireBill().then(result => {
				expect(result).to.equal(true);
				return expect(billHelperController.parameters.store['bill']).to.deep.equal(bill);
			});

		});

	});

	describe('validateBill', () => {

		it('successfully validates a bill (error)', () => {

			let bill = getValidBill();

			bill.paid = true;

			const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');
			let billHelperController = new BillHelperController();

			billHelperController.parameters.set('bill', bill);

			try{
				billHelperController.validateBill();
			}catch(error){
				expect(error.message).to.equal('[400] Bill is already paid.');
			}

		});

		it('successfully validates a bill', () => {

			let bill = getValidBill();

			bill.paid = false;
			delete bill.paid_result;

			const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');
			let billHelperController = new BillHelperController();

			billHelperController.parameters.set('bill', bill);

			let result = billHelperController.validateBill();

			expect(result).to.equal(true);

		});

	});

	describe('updateBillWithPaymentToken', () => {

		it('successfully updates a bill with a payment token', () => {

			let bill = getValidBill();
			let token = getValidToken();
			let updated_bill = objectutilities.clone(bill);

			updated_bill.paid = true;
			updated_bill.paid_result = token;

			let mock_bill = class {
				constructor(){}

				updatePaidResult() {
					return Promise.resolve(updated_bill);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Bill.js'), mock_bill);

			const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');
			let billHelperController = new BillHelperController();

			billHelperController.parameters.set('bill', bill);
			billHelperController.parameters.set('token', token);

			return billHelperController.updateBillWithPaymentToken().then(result => {
				expect(result).to.equal(true);
				return expect(billHelperController.parameters.store['bill']).to.deep.equal(updated_bill);
			});

		});

		it('successfully updates a bill with a payment token when bill is overdue', () => {

			let bill = getValidBill();
			let token = getValidToken();
			let updated_bill = objectutilities.clone(bill);

			bill.overdue = true;
			updated_bill.paid = true;
			updated_bill.paid_result = token;

			let mock_bill = class {
				constructor(){}

				updatePaidResult() {
					return Promise.resolve(updated_bill);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Bill.js'), mock_bill);

			const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');
			let billHelperController = new BillHelperController();

			billHelperController.parameters.set('bill', bill);
			billHelperController.parameters.set('token', token);

			return billHelperController.updateBillWithPaymentToken().then((result) => {
				expect(result).to.equal(true);
				return expect(billHelperController.parameters.store['bill']).to.deep.equal(updated_bill);
			});

		});

	});

	describe('isPaid', () => {

		it('returns true when bill is paid:true', () => {

			let bill = getValidBill();

			bill.paid = true;

			const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');
			let billHelperController = new BillHelperController();

			let result = billHelperController.isPaid(bill);

			expect(result).to.equal(true);

		});

		it('returns true when bill has paid_result:token', () => {

			let bill = getValidBill();

			bill.paid = false;
			bill.paid_result = getValidToken();

			const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');
			let billHelperController = new BillHelperController();

			let result = billHelperController.isPaid(bill);

			expect(result).to.equal(true);

		});

		it('returns true when bill is paid:false', () => {

			let bill = getValidBill();

			bill.paid = false;
			delete bill.paid_result;

			const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');
			let billHelperController = new BillHelperController();

			let result = billHelperController.isPaid(bill);

			expect(result).to.equal(false);

		});

	});

	describe('setPayment', () => {

		it('successfully sets a payment token', () => {

			let bill = getValidBill();
			let token = getValidToken();
			let updated_bill = objectutilities.clone(bill);

			bill.paid = false;
			delete bill.paid_result;
			updated_bill.paid = true;
			updated_bill.paid_result = token;

			let mock_bill = class {
				constructor(){}

				get() {
					return Promise.resolve(bill);
				}

				updatePaidResult() {
					return Promise.resolve(updated_bill);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Bill.js'), mock_bill);

			const BillHelperController = global.SixCRM.routes.include('helpers','entities/bill/Bill.js');
			let billHelperController = new BillHelperController();

			return billHelperController.setPayment({id: bill.id, token: token}).then(result => {
				return expect(result).to.deep.equal(updated_bill);
			});

		});

	});

});
