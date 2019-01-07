

const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

function assumePermissionedRole(){

	let permissions = [
		{
			action:'*',
			object: '*'
		}
	];

	PermissionTestGenerators.givenUserWithPermissionArray(permissions, 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

}

function getValidAmount(){
	return 12.99;
}

function getValidMerchantProvider(id){
	return MockEntities.getValidMerchantProvider(id);
}

function getValidCreditCard(id){
	return MockEntities.getValidCreditCard(id);
}

function getValidCustomer(id){
	return MockEntities.getValidCustomer(id);
}

describe('helpers/transaction/Process.spec.js', () => {

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

	after(() => {
		mockery.disable();
	});

	it('fails when required parameters are not presented', () => {

		const processHelperController = global.SixCRM.routes.include('helpers', 'transaction/Process.js');
		let ph = new processHelperController();
		let parameters = {};

		try{
			ph.parameters.setParameters({argumentation: parameters, action: 'process'});
		}catch(error){
			expect(error.message).to.equal('[500] Missing source object field: "customer".');
		}

		parameters = {
			customer: ''
		}

		try{
			ph.parameters.setParameters({argumentation: parameters, action: 'process'});
		}catch(error){
			expect(error.message).to.equal('[500] Missing source object field: "creditcard".');
		}

		parameters = {
			customer: '',
			creditcard: ''
		};

		try{
			ph.parameters.setParameters({argumentation: parameters, action: 'process'});
		}catch(error){
			expect(error.message).to.equal('[500] Missing source object field: "amount".');
		}

		parameters = {
			customer: '',
			creditcard: '',
			amount:''
		};

		try{
			ph.parameters.setParameters({argumentation: parameters, action: 'process'});
		}catch(error){
			expect(error.message).to.equal('[500] Missing source object field: "merchant_provider".');
		}

	});

	it('fails when required parameters are not correct', () => {

		const processHelperController = global.SixCRM.routes.include('helpers', 'transaction/Process.js');
		let ph = new processHelperController();

		let parameters = {
			customer: '',
			creditcard: '',
			amount: '',
			merchant_provider: ''
		};

		try{

			ph.parameters.setParameters({argumentation: parameters, action: 'process'});

		}catch(e){

			expect(e.message).to.have.string('[500] One or more validation errors occurred:');

		}

		let customer = getValidCustomer();

		parameters = {
			customer: customer.id,
			creditcard: '',
			amount: '',
			merchant_provider: ''
		};

		try{

			ph.parameters.setParameters({argumentation: parameters, action: 'process'});

		}catch(e){

			expect(e.message).to.have.string('[500] One or more validation errors occurred:');

		}

		let creditcard = getValidCreditCard();

		parameters = {
			customer: customer.id,
			creditcard: creditcard.id,
			amount: '',
			merchant_provider: ''
		};

		try{

			ph.parameters.setParameters({argumentation: parameters, action: 'process'});

		}catch(e){

			expect(e.message).to.have.string('[500] One or more validation errors occurred:');

		}

	});

	it('succeeds when required parameters are present', () => {

		const processHelperController = global.SixCRM.routes.include('helpers', 'transaction/Process.js');
		let ph = new processHelperController();

		let customer = getValidCustomer();
		let creditcard = getValidCreditCard();
		let amount = getValidAmount();
		let merchant_provider = getValidMerchantProvider();

		let parameters = {
			customer: customer.id,
			creditcard: creditcard.id,
			amount: amount,
			merchant_provider: merchant_provider.id
		};

		ph.parameters.setParameters({argumentation: parameters, action: 'process'});

		expect(ph.parameters.get('customer')).to.equal(parameters.customer);
		expect(ph.parameters.get('creditcard')).to.equal(parameters.creditcard);
		expect(ph.parameters.get('amount')).to.equal(parameters.amount);
		expect(ph.parameters.get('merchantproviderid')).to.equal(parameters.merchant_provider);

	});

	it('does not set non-whitelisted optional parameters', () => {

		const processHelperController = global.SixCRM.routes.include('helpers', 'transaction/Process.js');
		let ph = new processHelperController();

		let customer = getValidCustomer();
		let creditcard = getValidCreditCard();
		let amount = getValidAmount();
		let merchantprovider = getValidMerchantProvider();
		let parameters = {
			customer: customer.id,
			creditcard: creditcard.id,
			amount: amount,
			merchant_provider: merchantprovider.id,
			somethingelse:'abc123'
		};

		ph.parameters.setParameters({argumentation: parameters, action: 'process'});

		try{
			ph.parameters.get('somethingelse')
		}catch(e){
			expect(e.message).to.equal('[500] "somethingelse" property is not set.');
		}

	});

	it('successfully hydrates the merchant provider', () => {

		assumePermissionedRole();

		let merchant_provider = getValidMerchantProvider();

		mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProvider.js'), class {
			get(){
				return Promise.resolve(merchant_provider);
			}
			sanitize(argument){
				expect(argument).to.be.a('boolean');
			}
		});

		const processHelperController = global.SixCRM.routes.include('helpers', 'transaction/Process.js');
		let ph = new processHelperController();

		ph.parameters.set('merchantproviderid', merchant_provider.id)

		return ph.hydrateMerchantProvider().then(() => {

			expect(ph.parameters.get('merchantprovider')).to.deep.equal(merchant_provider);

		});

	});

	it('processes a transaction', () => {

		let creditcard = getValidCreditCard();
		let customer = getValidCustomer();

		customer.creditcards = [creditcard.id];
		let merchant_provider = getValidMerchantProvider();
		let amount = getValidAmount();

		let parameters = {
			customer: customer.id,
			creditcard: creditcard.id,
			amount: amount,
			merchant_provider: merchant_provider.id
		};

		mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProvider.js'), class {
			get(){
				return Promise.resolve(merchant_provider);
			}
			sanitize(argument){
				expect(argument).to.be.a('boolean');
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'vendors/merchantproviders/'+merchant_provider.gateway.name+'/handler.js'), class {
			constructor(){}
			process(){
				return {
					code: 'success',
					message: 'Success',
					merchant_provider:merchant_provider.id,
					result:{
						response: '1',
						responsetext: 'SUCCESS',
						authcode: '123456',
						avsresponse: 'N',
						cvvresponse: '',
						orderid: '',
						type: 'sale',
						response_code: '100'
					}
				}
			}
		});

		const ProcessHelper = global.SixCRM.routes.include('helpers', 'transaction/Process.js');
		let ph = new ProcessHelper();

		return ph.process(parameters).then((response) => {

			expect(response.code).to.equal('success');
			expect(response.message).to.equal('Success');
			expect(response.merchant_provider).to.equal(merchant_provider.id);
			expect(response.result).to.include({
				response: '1',
				responsetext: 'SUCCESS',
				authcode: '123456',
				avsresponse: 'N',
				cvvresponse: '',
				orderid: '',
				type: 'sale',
				response_code: '100'
			});

		});

	});

});
