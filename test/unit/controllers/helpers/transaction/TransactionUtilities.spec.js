
const _ = require('lodash');
const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
let arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');
const TransactionUtilitiesHelperController = global.SixCRM.routes.include('helpers', 'transaction/TransactionUtilities.js');

function getInvalidArgumentsArray(omit){

	let invalid_arguments = [{}, [], new Error(), null, undefined, 123, 'abc', () => {}];

	omit = (_.isUndefined(omit))?[]:omit;

	return arrayutilities.filter(invalid_arguments, (invalid_argument) => {
		if(arrayutilities.nonEmpty(omit)){
			return !(_.includes(omit, invalid_argument));
		}
		return true;
	});

}

function getValidGatewayConstructorNames(){

	return ['NMIController', 'InnovioController'];

}

function getValidSelectedMerchantProvidersArray(){

	return [
		MockEntities.getValidMerchantProvider(),
		MockEntities.getValidMerchantProvider()
	];

}

describe('helpers/transaction/TransactionUtilities.spec.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('makeGeneralBrandString', () => {

		it('Fails for invalid arguments generates a brand string',  () => {

			let transactionUtilitiesController = new TransactionUtilitiesHelperController();

			let invalid_arguments = getInvalidArgumentsArray({omit: ['abc']});

			arrayutilities.map(invalid_arguments, invalid_argument => {

				try{
					transactionUtilitiesController.makeGeneralBrandString(invalid_argument);
				}catch(error){
					expect(error.message).to.equal('[500] StringUtilities.isString thing argument is not an string.');
				}

			});

		});

		it('Successfully generates a brand string',  () => {

			let transactionUtilitiesController = new TransactionUtilitiesHelperController();

			let brandstring = transactionUtilitiesController.makeGeneralBrandString('American Express');

			expect(brandstring).to.equal('americanexpress');


		});

	});

	describe('setParameters', () => {

		it('fails to set parameters', () => {

			let transactionUtilitiesController = new TransactionUtilitiesHelperController();

			transactionUtilitiesController.parameters = {required:{}, optional:{}};
			let invalid_arguments_array = getInvalidArgumentsArray();

			arrayutilities.map(invalid_arguments_array, invalid_argument => {
				try{
					transactionUtilitiesController.setParameters(invalid_argument);
				}catch(error){
					expect(error.message).to.be.defined;
				}
			});
		});

	});

	/*
  describe('validateParameters', () => {

    //Technical Debt:  Test failures...
    it('passes when parameters validate', () => {

      let transactionUtilitiesController = new TransactionUtilitiesHelperController();

      transactionUtilitiesController.parameter_definitions = {
        required:{},
        optional:{}
      };

      //set required and optional
      let parameters = {

      };

      transactionUtilitiesController.setParameters(parameters);

      let validated = transactionUtilitiesController.validateParameters();

      expect(validated).to.equal(true);

    });

  });
  */

	describe('instantiateParameters', () => {

		it('successfully instantiates parameters', () => {

			let transactionUtilitiesController = new TransactionUtilitiesHelperController();

			//example of properly set parameter validation
			transactionUtilitiesController.parameter_validation = {
				'transaction': global.SixCRM.routes.path('model', 'transaction/transaction.json')
			};

			transactionUtilitiesController.instantiateParameters();

			expect(transactionUtilitiesController.parameters.parameter_validation)
				.to.deep.equal(transactionUtilitiesController.parameter_validation);
		});

		it('returns empty object when parameter_validation hasn\'t previously existed', () => {

			let transactionUtilitiesController = new TransactionUtilitiesHelperController();

			//making sure that parameter validation is not set
			delete transactionUtilitiesController.parameter_validation;

			transactionUtilitiesController.instantiateParameters();

			expect(transactionUtilitiesController.parameters.parameter_validation)
				.to.deep.equal({});
		});
	});

	describe('instantiateGateway', () => {

		//Technical Debt: Validate unhappy stuff...

		it('successfully instantiates a processor gateway class ', () => {

			let merchantproviders = getValidSelectedMerchantProvidersArray();

			let instantiated_gateways = arrayutilities.map(merchantproviders, merchantprovider => {

				let transactionUtilitiesController = new TransactionUtilitiesHelperController();

				transactionUtilitiesController.instantiateParameters();

				transactionUtilitiesController.parameters.set('selected_merchantprovider', merchantprovider);

				return transactionUtilitiesController.instantiateGateway()
					.then(() => {
						return transactionUtilitiesController.parameters.get('instantiated_gateway');
					});

			});

			return Promise.all(instantiated_gateways).then(instantiated_gateways => {
				arrayutilities.map(instantiated_gateways, instantiated_gateway => {
					expect(_.includes(getValidGatewayConstructorNames(), instantiated_gateway.constructor.name)).to.equal(true);
				});
			});

		});

	});

});
