const mockery = require('mockery');
let chai = require('chai');

let expect = chai.expect;
let objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
let random = require('@sixcrm/sixcrmcore/util/random').default;
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const timestamp = require('@sixcrm/sixcrmcore/util/timestamp').default;

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

		it('throws a error (missing context)', () => {

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			try{
				eventPushHelperController.pushEvent({event_type: 'some_event'});
				expect(false).to.equal(true, 'Method should not have executed');
			}catch(error){
				expect(error.message).to.equal('[500] Unset context.');
			}

		});

		it('throws a error (missing user)', () => {

			const global_user = global.user;
			delete global.user;

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			try{
				eventPushHelperController.pushEvent({event_type: 'some_event', context: {}});
				expect(false).to.equal(true, 'Method should not have executed');
			}catch(error){
				expect(error.message).to.equal('[500] Global missing "user" property.');
			}

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

	describe('pushEvent (LIVE)', async () => {

		it.only('successfully pushes a event', async () => {

			mockery.deregisterAll();

			global.user = {
				id: 'tmdalbey@gmail.com'
			};

			let context = {testing: 'This is a test', account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'}

			/*
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
			*/

			const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');
			let eventPushHelperController = new EventPushHelperController();

			let result = await eventPushHelperController.pushEvent({event_type: 'test', context: context});
			//expect(result).to.have.property('MessageId');
			console.log(result);


		});

	});

});
