const chai = require('chai');
const expect = chai.expect;
const mockery = require('mockery');
const stringutilities = require('@sixcrm/sixcrmcore/util/string-utilities').default;

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
