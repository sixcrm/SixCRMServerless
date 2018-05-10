let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('controllers/Role.js', () => {

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
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	describe('getPermissions', () => {

		it('returns role permission', () => {

			let role = {
				permissions: 'a_permission'
			};

			const RoleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');
			const roleController = new RoleController();

			expect(roleController.getPermissions(role)).to.equal('a_permission');
		});

		it('returns null when role permission is not defined', () => {

			let role = {};

			const RoleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');
			const roleController = new RoleController();

			expect(roleController.getPermissions(role)).to.equal(null);
		});
	});
});
