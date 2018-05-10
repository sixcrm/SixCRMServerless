let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');

function getValidBill() {
	return MockEntities.getValidBill()
}

describe('controllers/entities/Bill.js', () => {

	let account_copy;

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		//global.SixCRM.localcache.clear('all');
		account_copy = global.account;

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

		let mock_preindexing_helper = class {
			constructor(){

			}
			addToSearchIndex(){
				return Promise.resolve(true);
			}
			removeFromSearchIndex(){
				return Promise.resolve(true);
			}
		};

		mockery.registerMock(global.SixCRM.routes.path('helpers', 'indexing/PreIndexing.js'), mock_preindexing_helper);

		mockery.registerMock(global.SixCRM.routes.path('helpers', 'analytics/Activity.js'), class {
			createActivity() {
				return Promise.resolve();
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/notification/Notification.js'), class {
			createNotificationForAccountAndUser() {
				return Promise.resolve({});
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
		global.account = account_copy;
	});

	describe('update', () => {

		it('successfully updates bill', () => {

			let entity = getValidBill();

			PermissionTestGenerators.givenUserWithAllowed('update', 'bill', '*');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [entity]});
				}
				saveRecord(tableName, entity) {
					expect(entity).to.have.property('created_at');
					expect(entity).to.have.property('updated_at');
					expect(entity).to.have.property('id');
					expect(timestamp.differenceInMiliseconds(entity.created_at, entity.updated_at)).to.be.below(5);
					return Promise.resolve(entity);
				}
			});

			//prepare permissions
			global.account = '*';

			const BillController = global.SixCRM.routes.include('controllers','entities/Bill.js');
			const billController = new BillController();

			return billController.update({entity}).then((result) => {
				expect(result).to.equal(entity);
			});
		});

		it('throws error when user is not authorized to perform update action', () => {

			let entity = getValidBill();

			//remove permissions
			delete global.account;

			const BillController = global.SixCRM.routes.include('controllers','entities/Bill.js');
			const billController = new BillController();

			try {
				billController.update({entity})
			}catch(error) {
				expect(error.message).to.equal('[403] User is not authorized to perform this action.');
			}
		});

		it('throws error when entity does not have expected fields', () => {

			let entity = getValidBill();

			delete entity.id;

			PermissionTestGenerators.givenUserWithAllowed('update', 'bill', '*');

			//prepare permissions
			global.account = '*';

			const BillController = global.SixCRM.routes.include('controllers','entities/Bill.js');
			const billController = new BillController();

			try {
				billController.update({entity})
			}catch(error) {
				expect(error.message).to.equal('[400] Unable to update bill. Missing property "id"');
			}
		});
	});

	describe('updatePaidResult', () => {

		it('successfully updates paid result', () => {

			let entity = getValidBill();

			PermissionTestGenerators.givenUserWithAllowed('update', 'bill', '*');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve({Items: [entity]});
				}
				saveRecord(tableName, entity) {
					expect(entity).to.have.property('created_at');
					expect(entity).to.have.property('updated_at');
					expect(entity).to.have.property('id');
					expect(timestamp.differenceInMiliseconds(entity.created_at, entity.updated_at)).to.be.below(5);
					return Promise.resolve(entity);
				}
			});

			//prepare permissions
			global.account = '*';

			const BillController = global.SixCRM.routes.include('controllers','entities/Bill.js');
			const billController = new BillController();

			return billController.updatePaidResult({entity}).then((result) => {
				expect(result).to.equal(entity);
			});
		});

		it('throws error when entity does not have expected fields', () => {

			let entity = getValidBill();

			delete entity.id;

			PermissionTestGenerators.givenUserWithAllowed('update', 'bill', '*');

			//prepare permissions
			global.account = '*';

			const BillController = global.SixCRM.routes.include('controllers','entities/Bill.js');
			const billController = new BillController();

			try {
				billController.updatePaidResult({entity})
			}catch(error) {
				expect(error.message).to.equal('[400] Unable to update bill. Missing property "id"');
			}
		});
	});

	describe('create', () => {

		it('successfully creates bill', () => {

			let entity = getValidBill();

			delete entity.updated_at; //remove unnecessary field

			PermissionTestGenerators.givenUserWithAllowed('create', 'bill', '*');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					expect(entity).to.have.property('created_at');
					expect(entity).to.have.property('id');
					return Promise.resolve(entity);
				}
			});

			//prepare permissions
			global.account = '*';

			const BillController = global.SixCRM.routes.include('controllers','entities/Bill.js');
			const billController = new BillController();

			return billController.create({entity}).then((result) => {
				expect(result).to.equal(entity);
			});
		});

		it('throws error when user is not authorized to perform create action', () => {

			let entity = getValidBill();

			//remove permissions
			delete global.account;

			const BillController = global.SixCRM.routes.include('controllers','entities/Bill.js');
			const billController = new BillController();

			try {
				billController.create({entity})
			}catch(error) {
				expect(error.message).to.equal('[403] User is not authorized to perform this action.');
			}
		});

		it('throws error when entity does not have expected fields', () => {

			let entity = getValidBill();

			delete entity.id;

			PermissionTestGenerators.givenUserWithAllowed('create', 'bill', '*');

			//prepare permissions
			global.account = '*';

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords() {
					return Promise.resolve([]);
				}
				saveRecord(tableName, entity) {
					return Promise.resolve(entity);
				}
			});

			const BillController = global.SixCRM.routes.include('controllers','entities/Bill.js');
			const billController = new BillController();

			try {
				billController.create({entity})
			}catch(error) {
				expect(error.message).to.equal('[400] Unable to update bill. Missing property "id"');
			}
		});
	});
});
