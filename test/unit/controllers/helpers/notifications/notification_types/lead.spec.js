
const _ = require('lodash');
const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib','array-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

let notification_name = 'lead';
let notification_readable_name = 'Lead';

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

	describe('constructor', () => {
		it('successfully constructs', () => {
			let NotificationType = global.SixCRM.routes.include('helpers', 'notifications/notificationtypes/'+notification_name+'.js');
			const notification_class = new NotificationType();

			expect(objectutilities.getClassName(notification_class)).to.equal(notification_readable_name+'Notification');
		});
	});

	describe('transformContext', () => {

		let required_fields = ['account','user', 'name', 'type','category','context'];

		it('successfully transforms the context object', () => {

			let context = global.SixCRM.routes.include('test','unit/controllers/helpers/notifications/resources/'+notification_name+'.context.json');

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

			if(_.has(notification_class, 'context_required')){
				arrayutilities.map(notification_class.context_required, required_context_field => {
					expect(transformed_context.context).to.have.property(required_context_field);
				});
			}

			du.info(transformed_context);

		});
	});

});
