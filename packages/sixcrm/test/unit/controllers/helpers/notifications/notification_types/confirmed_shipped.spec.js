
const _ = require('lodash');
const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

let notification_name = 'confirmed_shipped';
let notification_readable_name = 'ConfirmedShipped';

describe('/helpers/notifications/notification_types/'+notification_name+'.js', () => {
	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {
		it('successfully constructs', () => {
			let NotificationType = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/'+notification_name+'.js');
			const notification_class = new NotificationType();

			expect(objectutilities.getClassName(notification_class)).to.equal(notification_readable_name+'Notification');

		});
	});

	describe('transformContext', () => {

		let required_fields = ['account','type','category','context'];

		it('successfully transforms the context object', () => {

			let context = {
				user: { id: 'owner.user@test.com' },
				account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
				rebill: MockEntities.getValidRebill()
			};

			let NotificationType = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/'+notification_name+'.js');
			const notification_class = new NotificationType();
			let transformed_context = notification_class.transformContext(context);

			arrayutilities.map(required_fields, key => {
				expect(transformed_context).to.have.property(key);
			});

			if(!_.has(notification_class, 'account_wide')){
				expect(transformed_context).to.have.property('user');
				expect(transformed_context.user).to.not.equal(null);
			}

			du.info(transformed_context);

		});

	});

});
