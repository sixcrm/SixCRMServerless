const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const stringutilities = require('@6crm/sixcrmcore/util/string-utilities').default;
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

describe('controllers/endpoints/transaction', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('initialize', () => {

		it('successfully initialize the transaction class without callback function', () => {
			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

			let transactionController = new TransactionController();

			expect(transactionController.initialize()).to.be.true;
		});

		xit('successfully initialize the transaction class with callback function', () => {

			let a_function = () => {return 'result from function'}; //any function

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

			let transactionController = new TransactionController();

			expect(transactionController.initialize(a_function)).to.equal('result from function');

		});

	});

	xdescribe('pushEvent', async () => {
		it('throws an error', () => {

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
			let transactionController = new TransactionController();

			try{
				transactionController.pushEvent();
				expect(false).to.equal(true, 'Method should not have executed');
			}catch(error){
				expect(error.message).to.equal('[500] Unable to identify event_type.');
			}

		});

		it('throws a error (missing context)', () => {

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
			let transactionController = new TransactionController();

			try{
				transactionController.pushEvent({event_type: 'some_event'});
				expect(false).to.equal(true, 'Method should not have executed');
			}catch(error){
				expect(error.message).to.equal('[500] Unset context.');
			}

		});

		it('throws a error (missing user)', () => {

			const global_user = global.user;
			delete global.user;

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
			let transactionController = new TransactionController();

			try{
				transactionController.pushEvent({event_type: 'some_event', context: {}});
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

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
			let transactionController = new TransactionController();

			let result = await transactionController.pushEvent({context: {event_type: 'test'}});
			expect(result).to.have.property('MessageId');
			expect(result.MessageId).to.equal('somemessageid');

		});

		it('gets event type from class', async () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor(){}
				pushEvent({event_type, context}){
					expect(event_type).to.equal('test');
					return Promise.resolve({MessageId:'somemessageid'});
				}
			});

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
			let transactionController = new TransactionController();
			transactionController.event_type = 'test';

			let result = await transactionController.pushEvent({context: {}});
			expect(result).to.have.property('MessageId');
			expect(result.MessageId).to.equal('somemessageid');

		});

		it('gets context from class', async () => {

			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				constructor(){}
				pushEvent({event_type, context}){
					expect(event_type).to.equal('test');
					expect(context).to.have.property('hi');
					expect(context.hi).to.equal('there');
					return Promise.resolve({MessageId:'somemessageid'});
				}
			});

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
			let transactionController = new TransactionController();
			transactionController.parameters = {store:{hi: 'there'}}

			let result = await transactionController.pushEvent({event_type: 'test'});
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

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
			let transactionController = new TransactionController();
			transactionController.parameters = {store:{hi: 'there'}}

			let result = await transactionController.pushEvent({event_type: 'test'});
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

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');
			let transactionController = new TransactionController();
			transactionController.event_type = 'test';
			transactionController.parameters = {store:{hi: 'there'}}

			let result = await transactionController.pushEvent();
			expect(result).to.have.property('MessageId');
			expect(result.MessageId).to.equal('somemessageid');

		});

	});

	describe('validateInput', () => {

		it('throws error if validation function is not a function', () => {

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

			let transactionController = new TransactionController();

			return transactionController.validateInput('an-event', 'not_a_function').catch(error =>
				expect(error.message).to.equal('[500] Validation function is not a function.'));
		});

		it('throws error if event input is undefined', () => {

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

			let transactionController = new TransactionController();

			return transactionController.validateInput(undefined, () => {}).catch(error =>
				expect(error.message).to.equal('[500] Undefined event input.'));
		});

		it('throws validation error', () => {

			let a_function_with_errors = () => {return {errors: ['an_error']}};

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

			let transactionController = new TransactionController();

			return transactionController.validateInput('an_event', a_function_with_errors).catch(error =>
				expect(error.message).to.equal('[500] One or more validation errors occurred.'));
		});

		it('validates input', () => {

			const TransactionController = global.SixCRM.routes.include('controllers', 'endpoints/components/transaction.js');

			let transactionController = new TransactionController();

			return transactionController.validateInput('an_event', () => {}).then(result =>
				expect(result).to.equal('an_event'));
		});

	});

});
