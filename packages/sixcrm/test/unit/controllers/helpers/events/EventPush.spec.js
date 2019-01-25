const mockery = require('mockery');
let chai = require('chai');

let expect = chai.expect;
let objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
let random = require('@6crm/sixcrmcore/lib/util/random').default;
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

describe('helpers/events/Event.spec.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'us-east-1';
			}
		});

	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			expect(objectutilities.getClassName(eventPushHelperController)).to.equal('EventPushHelperController');
		});

	});

	describe('pushEvent', async () => {

		it('throws an error', async () => {

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			try{
				eventPushHelperController.pushEvent();
				expect(false).to.equal(true, 'Method should not have executed');
			}catch(error){
				expect(error.message).to.equal('[500] Unable to identify event_type.');
			}

		});

		it('assumes system user', () => {

			const global_user = global.user;
			delete global.user;

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor(){}
				pushEvent({event_type, context}){
					expect(context.user.id).to.equal('system@sixcrm.com');
					return Promise.resolve({MessageId:'somemessageid'});
				}
			});

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			eventPushHelperController.pushEvent({event_type: 'some_event', context: {}});

			global.user = global_user;

		});

		it('gets event type from context', async () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor(){}
				pushEvent({event_type, context}){
					expect(event_type).to.equal('test');
					return Promise.resolve({MessageId:'somemessageid'});
				}
			});

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			let result = await eventPushHelperController.pushEvent({context: {event_type: 'test'}});
			expect(result).to.have.property('MessageId');
			expect(result.MessageId).to.equal('somemessageid');

		});

		it('gets sets the global user in context', async () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor(){}
				pushEvent({event_type, context}){
					expect(event_type).to.equal('test');
					expect(context).to.have.property('hi');
					expect(context.hi).to.equal('there');
					expect(context).to.have.property('id');
					expect(context).to.have.property('user');
					expect(context.user).to.have.property('id');
					expect(context.user.id).to.equal('some.user@example.com');
					return Promise.resolve({MessageId:'somemessageid'});
				}
			});

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			let result = await eventPushHelperController.pushEvent({event_type: 'test', context: {hi: 'there'}});
			expect(result).to.have.property('MessageId');
			expect(result.MessageId).to.equal('somemessageid');

		});

		it('executes with no argumentation', async () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor(){}
				pushEvent({event_type, context}){
					expect(event_type).to.equal('test');
					expect(context).to.have.property('hi');
					expect(context.hi).to.equal('there');
					expect(context).to.have.property('id');
					expect(context).to.have.property('user');
					expect(context.user).to.have.property('id');
					expect(context.user.id).to.equal('some.user@example.com');
					return Promise.resolve({MessageId:'somemessageid'});
				}
			});

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			let result = await eventPushHelperController.pushEvent({event_type: 'test', context: {hi: 'there'}});
			expect(result).to.have.property('MessageId');
			expect(result.MessageId).to.equal('somemessageid');

		});

	});

	xdescribe('pushEvent (LIVE)', async () => {

		it('successfully pushes a event (lead)', async () => {

			mockery.deregisterAll();

			global.user = {
				id: 'timothy.dalbey@sixcrm.com'
			};

			let event_type = 'lead';
			let context = {
				campaign:{
					name: 'Testing Campaign'
				},
				customer:{
					id: '24f7c851-29d4-4af9-87c5-0298fa74c689'
				},
				account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
			}

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			let result = await eventPushHelperController.pushEvent({event_type: event_type, context: context});
			console.log(result);

		});

		it('successfully pushes a event (test)', async () => {

			mockery.deregisterAll();

			global.user = {
				id: 'timothy.dalbey@sixcrm.com'
			};

			let context = {testing: 'This is a test', account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'}

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			let result = await eventPushHelperController.pushEvent({event_type: 'testalert', context: context});
			console.log(result);

		});

	});

});
