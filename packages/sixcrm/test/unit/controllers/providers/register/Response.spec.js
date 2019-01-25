
const chai = require("chai");
const expect = chai.expect;
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

const RegisterResponseController = global.SixCRM.routes.include('providers', 'register/Response.js');

function getValidTransactions(){
	return MockEntities.getValidTransactions()
}

function getValidProcessorResponses(){

	return [MockEntities.getValidProcessorResponse()];

}

describe('controllers/providers/register/Response.js', () => {

	describe('constructor', () => {
		it('successfully executes the constructor', () => {

			let registerResponseController = new RegisterResponseController({});

			expect(objectutilities.getClassName(registerResponseController)).to.equal('RegisterResponse');

			expect(registerResponseController).to.have.property('merged_parameter_validation');
			expect(registerResponseController.merged_parameter_validation).to.have.property('transactions');
			expect(registerResponseController.merged_parameter_validation).to.have.property('processorresponses');

			expect(registerResponseController).to.have.property('merged_parameter_definition');
			expect(registerResponseController.merged_parameter_definition).to.have.property('constructor');
			expect(registerResponseController.merged_parameter_definition['constructor'].optional).to.deep.equal({
				response_type:'response_type',
				transactions:'transactions',
				processorresponses:'processor_responses',
				creditcard:'creditcard'
			});

		});

		it('successfully executes the constructor with argumentation', () => {

			let transactions = getValidTransactions();
			let processor_responses = getValidProcessorResponses();
			let response_type = 'success';

			let registerResponseController = new RegisterResponseController({transactions: transactions, processor_responses: processor_responses, response_type: response_type});

			expect(registerResponseController).to.have.property('merged_parameter_validation');
			expect(registerResponseController.merged_parameter_validation).to.have.property('transactions');
			expect(registerResponseController.merged_parameter_validation).to.have.property('processorresponses');

			expect(registerResponseController).to.have.property('merged_parameter_definition');
			expect(registerResponseController.merged_parameter_definition).to.have.property('constructor');
			expect(registerResponseController.merged_parameter_definition['constructor'].optional).to.deep.equal({
				response_type:'response_type',
				transactions:'transactions',
				processorresponses:'processor_responses',
				creditcard:'creditcard'
			});

			expect(registerResponseController.parameters.store.processorresponses).to.deep.equal(processor_responses);
			expect(registerResponseController.parameters.store.transactions).to.deep.equal(transactions);
			expect(registerResponseController.parameters.store.response_type).to.deep.equal(response_type);

		});

	});

	describe('setTransaction', () => {
		it('successfully sets a transaction', () => {
			let registerResponseController = new RegisterResponseController({});
			let transactions = getValidTransactions();

			registerResponseController.setTransactions(transactions);
			expect(registerResponseController.parameters.store.transactions).to.deep.equal(transactions);
		});
	});

	describe('getTransaction', () => {
		it('successfully gets a transaction', () => {
			let registerResponseController = new RegisterResponseController({});
			let transactions = getValidTransactions();

			registerResponseController.setTransactions(transactions);
			expect(registerResponseController.getTransactions()).to.deep.equal(transactions);
		});
	});

	describe('setProcessorResponse', () => {
		it('successfully sets a processor response', () => {
			let registerResponseController = new RegisterResponseController({});
			let processor_responses = getValidProcessorResponses();

			registerResponseController.setProcessorResponses(processor_responses);

			du.warning(registerResponseController.parameters.store);
			expect(registerResponseController.parameters.store.processorresponses).to.deep.equal(processor_responses);
		});
	});

	describe('getProcessorResponse', () => {
		it('successfully gets a processor response', () => {
			let registerResponseController = new RegisterResponseController({});
			let processor_responses = getValidProcessorResponses();

			registerResponseController.setProcessorResponses(processor_responses);
			expect(registerResponseController.getProcessorResponses()).to.deep.equal(processor_responses);
		});
	});

});
