
const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

let ResponseController = global.SixCRM.routes.include('providers', 'Response.js');

describe('controllers/providers/Response.js', () => {

	describe('initialize', () => {
		it('Successfully initialize the response class', () => {
			let responseController =  new ResponseController();

			responseController.initialize();
			expect(responseController).to.have.property('parameters');
			expect(responseController).to.have.property('merged_parameter_validation');
			expect(responseController).to.have.property('merged_parameter_definition');
			expect(responseController).to.have.property('merged_response_types');
		});
	});

	describe('setResponseTypes', () => {

		//test bad arguments, missing arguments, structurally incomplete arguments
		it('sets a additional response type', () => {
			let responseController =  new ResponseController();

			responseController.response_types = {test:{code: 'test'}};
			responseController.setResponseTypes();
			expect(responseController.merged_response_types['test']).to.deep.equal(responseController.response_types.test);
		});

		it('returns immutable response types', () => {
			let responseController =  new ResponseController();

			responseController.setResponseTypes();
			expect(responseController.merged_response_types).to.deep.equal(responseController.getImmutableResponseTypes());
		});

	});

	describe('setParameterDefinition', () => {

		it('sets a additional parameter definition', () => {
			let responseController =  new ResponseController();

			responseController.parameter_definition = {thing:{required:{}, optional:{}}};
			responseController.setParameterDefinition();
			expect(responseController.merged_parameter_definition['thing']).to.deep.equal(responseController.parameter_definition.thing);
		});

		it('returns immutable response types', () => {
			let responseController =  new ResponseController();

			responseController.setParameterDefinition();
			expect(responseController.merged_parameter_definition).to.deep.equal(responseController.getImmutableParameterDefinition());
		});

	});

	describe('setParameterValidation', () => {
		it('sets a additional parameter validation', () => {
			let responseController =  new ResponseController();

			responseController.parameter_validation = {thing:'string'};
			responseController.setParameterValidation();
			expect(responseController.merged_parameter_validation['thing']).to.deep.equal(responseController.parameter_validation.thing);
		});

		it('returns immutable parameter validation', () => {
			let responseController =  new ResponseController();

			responseController.setParameterValidation();
			expect(responseController.merged_parameter_validation).to.deep.equal(responseController.getImmutableParameterValidation());
		});
	});

	describe('getImmutableResponseTypes', () => {
		it('Returns immutable response types', () => {
			let responseController = new ResponseController();

			expect(responseController.getImmutableResponseTypes()).to.deep.equal({
				success:{
					code: 'success'
				},
				fail:{
					code: 'decline'
				},
				decline:{
					code: 'decline'
				},
				noaction:{
					code: 'noaction'
				},
				error: {
					code: 'error'
				}
			});
		});
	});

	describe('getImmutableParameterValidation', () => {
		it('Returns immutable parameter definition', () => {
			let responseController = new ResponseController();

			expect(responseController.getImmutableParameterValidation()).to.deep.equal({
				response_type: global.SixCRM.routes.path('model', 'general/response/responsetype.json')
			});
		});
	});

	describe('getImmutableParameterDefinition', () => {
		it('Returns immutable response types', () => {
			let responseController = new ResponseController();

			expect(responseController.getImmutableParameterDefinition()).to.deep.equal({});
		});
	});

	describe('setResponse', () => {
		it('sets a response', () => {
			let responseController = new ResponseController();

			responseController.initialize();
			responseController.setResponse('success')
			expect(responseController.parameters.store.response_type).to.equal('success');
		});

		it('throws a error for a inappropriate response type', () => {
			let responseController = new ResponseController();

			responseController.initialize();
			try{
				responseController.setResponse('mangoes')
			}catch(error){
				expect(error.message).to.have.string('[500] One or more validation errors occurred:');
			}
		});
	});

	describe('getCode', () => {
		it('retrieves the appropriate code', () => {
			let responseController = new ResponseController();

			responseController.initialize();
			responseController.setResponse('success');
			expect(responseController.getCode()).to.equal('success');
		});
	});

});
