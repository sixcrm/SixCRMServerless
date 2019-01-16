

let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidResponseBody(response_type, action){

	let responses = {
		process:{
			success:'{"REQUEST_ACTION":"CCAUTHCAP","TRANS_STATUS_NAME":"APPROVED","TRANS_VALUE":30.23,"TRANS_ID":111600273,"CUST_ID":43005380,"XTL_CUST_ID":"7d2ad335-eadd-4c6a-972e-","PO_ID":99124294,"XTL_ORDER_ID":"","BATCH_ID":1130758,"PROC_NAME":"Test Processor","MERCH_ACCT_ID":47769,"CARD_BRAND_NAME":"Visa","PMT_L4":"1111","PROC_UDF01":"","PROC_UDF02":"","PROC_AUTH_RESPONSE":"TEST24478","PROC_RETRIEVAL_NUM":"13450A04-112A-41C5-B53E914E62A4A872","PROC_REFERENCE_NUM":"TEST385559842","AVS_RESPONSE":"M","CVV_RESPONSE":"M","REQUEST_API_VERSION":1,"PO_LI_ID_1":"53647821","PO_LI_COUNT_1":"1","PO_LI_AMOUNT_1":"30.23","PO_LI_PROD_ID_1":"64219"}\n',
			decline:'{"REQUEST_ACTION":"CCAUTHCAP","TRANS_STATUS_NAME":"DECLINED","TRANS_VALUE":5.05,"TRANS_ID":111601416,"CUST_ID":43005380,"XTL_CUST_ID":"219d94a9-4fd1-427e-aad3-","MERCH_ACCT_ID":47769,"CARD_BRAND_NAME":"Visa","PMT_L4":"1111","API_RESPONSE":"0","API_ADVICE":" ","SERVICE_RESPONSE":600,"SERVICE_ADVICE":"Declined","PROCESSOR_RESPONSE":"505","PROCESSOR_ADVICE":"Declined","INDUSTRY_RESPONSE":"0","INDUSTRY_ADVICE":" ","REF_FIELD":"","PROC_NAME":"Test Processor","AVS_RESPONSE":"","CVV_RESPONSE":"","REQUEST_API_VERSION":1}\n'
		}
	};

	return responses[action][response_type];

}

function getValidCustomer(id){
	return MockEntities.getValidCustomer(id);
}

function getValidCreditCard(id){
	return MockEntities.getValidCreditCard(id);
}

function getValidMerchantProvider(id, provider){
	return MockEntities.getValidMerchantProvider(id, provider);
}

/*function getValidMerchantProviderConfiguation(){
  return {
    username:"test@example.com",
    password:"Passw0rd!1",
    site_id: "0",
    merchant_account_id: "100",
    product_id: "1001"
  };
}

function getValidParametersObject(){
  return {
    request_response_format: 'JSON',
    request_api_version: '3.6',
    req_username: 'Tim',
    req_password: 'TestingPassword',
    site_id: '1',
    merchant_acct_id: 'absasdasd',
    li_prod_id_1: '1'
  };
}

function getValidMethodParametersObject(){
  return {request_action: 'CCAUTHCAP'};
}*/

function getValidTransaction(id){

	return  MockEntities.getValidTransaction(id);

}

describe('vendors/merchantproviders/Innovio.js', () => {

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

	describe('constructor', () => {

		it('Should to construct due to missing properties', () => {

			const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');

			try {
				new InnovioController({});
			}catch(error){
				expect(error.message).to.have.string('[500] Missing source object field:');
			}

		});

		it('Should Instantiate the Innovio Controller', () => {

			let merchant_provider = getValidMerchantProvider(null, 'Innovio');

			const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');
			let innovio_controller = new InnovioController({merchant_provider:merchant_provider});

			expect(innovio_controller.constructor.name).to.equal('InnovioController');

		});

	});

	describe('test', () => {

		it('successfully executes a test', () => {

			let merchant_provider = getValidMerchantProvider(null, 'Innovio');

			let body = {SERVICE_ADVICE: "User Authorized"};

			let response_object = {
				error: null,
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: JSON.stringify(body)
				},
				body: JSON.stringify(body)
			};

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response_object)
					}
				}
			});

			const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');
			let innovio_controller = new InnovioController({merchant_provider: merchant_provider});

			return innovio_controller.test({}).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');

			});

		});

		it('returns error', () => {

			let merchant_provider = getValidMerchantProvider(null, 'Innovio');

			let body = '{"REQUEST_ACTION":"","TRANS_STATUS_NAME":"","TRANS_VALUE":"","TRANS_ID":"","CUST_ID":"","XTL_CUST_ID":"","MERCH_ACCT_ID":"","CARD_BRAND_NAME":"","PMT_L4":"","API_RESPONSE":"101","API_ADVICE":"Invalid login information","SERVICE_RESPONSE":0,"SERVICE_ADVICE":" ","PROCESSOR_RESPONSE":0,"PROCESSOR_ADVICE":" ","INDUSTRY_RESPONSE":0,"INDUSTRY_ADVICE":" ","REF_FIELD":"","PROC_NAME":"","AVS_RESPONSE":"","CVV_RESPONSE":"","REQUEST_API_VERSION":1}\n';

			let response_object = {
				error: null,
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response_object)
					}
				}
			});

			const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');
			let innovio_controller = new InnovioController({merchant_provider: merchant_provider});

			return innovio_controller.test({}).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('error');
				expect(result.getResult().message).to.equal('Error');

			});

		});

	});

	describe('process', () => {

		it('should successfully process a transaction', () => {

			let customer = getValidCustomer();
			let creditcard = getValidCreditCard();

			creditcard.number = '4111111111111111';
			let amount = 30.23;

			let merchant_provider = getValidMerchantProvider(null, 'Innovio');

			/*
      merchant_provider.gateway = {
        name: 'Innovio',
        username: 'timothy.dalbey@sixrm.com',
        password: 'vIngelB92SWGNBDHTTQK',
        site_id: '45481',
        merchant_account_id: '47769',
        product_id: '64219'
      };
      */

			let body = getValidResponseBody('success', 'process');

			let response_object = {
				error: null,
				response: {
					statusCode: 200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response_object)
					}
				}
			});

			const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');
			let innovio_controller = new InnovioController({merchant_provider: merchant_provider});

			return innovio_controller.process({customer: customer, creditcard: creditcard, amount}).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');

			});

		});

		it('handles a declined transaction', () => {

			let customer = getValidCustomer();
			let creditcard = getValidCreditCard();

			creditcard.number = '4111111111111111';
			let amount = '5.05';

			let merchant_provider = getValidMerchantProvider(null, 'Innovio');

			let body = getValidResponseBody('decline','process');

			let response = {
				error: null,
				response:{
					statusCode:200,
					statusMessage: 'OK',
					body: body
				},
				body: body
			};

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');
			let innovio_controller = new InnovioController({merchant_provider: merchant_provider});

			return innovio_controller.process({customer: customer, creditcard: creditcard, amount}).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('decline');
				expect(result.getResult().message).to.equal('Declined');

			});

		});

	});

	describe('reverse', () => {

		it('Should successfully reverse a transaction', () => {

			let transaction = getValidTransaction();

			transaction.processor_response = {
				message:"Success",
				result:{
					PO_ID:"17171717"
				}
			};

			let body = {
				TRANS_STATUS_NAME: 'APPROVED'
			};

			let response = {
				error: null,
				response:{
					statusCode:200,
					statusMessage: 'OK',
					body: JSON.stringify(body)
				},
				body: JSON.stringify(body)
			};

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			let merchant_provider = getValidMerchantProvider(null, 'Innovio');

			/*
        merchant_provider.gateway = {
          name: 'Innovio',
          username: 'timothy.dalbey@sixrm.com',
          password: 'vIngelB92SWGNBDHTTQK',
          site_id: '45481',
          merchant_account_id: '47769',
          product_id: '64219'
        };
        */

			const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');
			let innovio_controller = new InnovioController({merchant_provider: merchant_provider});

			return innovio_controller.reverse({transaction: transaction}).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');

			});

		});

		it('handles declined reverse', () => {

			let transaction = getValidTransaction();

			transaction.processor_response = {
				message:"Success",
				result:{
					PO_ID:"17171717"
				}
			};

			let body = {
				API_RESPONSE: 600,
				TRANS_STATUS_NAME: 'DECLINED'
			};

			let response = {
				error: null,
				response:{
					statusCode:400,
					body: JSON.stringify(body)
				},
				body: JSON.stringify(body)
			};

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			let merchant_provider = getValidMerchantProvider(null, 'Innovio');

			merchant_provider.gateway = {
				name: 'Innovio',
				type: 'Innovio',
				username: 'timothy.dalbey@sixrm.com',
				password: 'vIngelB92SWGNBDHTTQK',
				site_id: '45481',
				merchant_account_id: '47769',
				product_id: '64219'
			};

			const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');
			let innovio_controller = new InnovioController({merchant_provider: merchant_provider});

			return innovio_controller.reverse({transaction: transaction}).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('decline');
				expect(result.getResult().message).to.equal('Declined');

			});

		});

	});

	describe('refund', () => {

		it('handles declined refund', () => {

			let transaction = getValidTransaction();

			transaction.processor_response = {
				message:"Success",
				result:{
					PO_ID:"17171717"
				}
			};

			let amount = 30.00;

			let body = {
				API_RESPONSE: 600,
				TRANS_STATUS_NAME: 'DECLINED'
			};

			let response = {
				error: null,
				response:{
					statusCode:400,
					body: JSON.stringify(body)
				},
				body: JSON.stringify(body)
			};

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			let merchant_provider = getValidMerchantProvider(null, 'Innovio');

			const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');
			let innovio_controller = new InnovioController({merchant_provider: merchant_provider});

			return innovio_controller.refund({transaction: transaction, amount: amount}).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('decline');
				expect(result.getResult().message).to.equal('Declined');

			});

		});

		it('Should successfully refund a transaction', () => {

			let transaction = getValidTransaction();

			transaction.processor_response = {
				message:"Success",
				result:{
					PO_ID:"17171717"
				}
			};

			let amount = 30.00;

			let body = {
				TRANS_STATUS_NAME: 'APPROVED'
			};

			let response = {
				error: null,
				response:{
					statusCode:200,
					statusMessage: 'OK',
					body: JSON.stringify(body)
				},
				body: JSON.stringify(body)
			};

			mockery.registerMock('@6crm/sixcrmcore/providers/http-provider', {
				default: class {
					post() {
						return Promise.resolve(response);
					}
				}
			});

			let merchant_provider = getValidMerchantProvider(null, 'Innovio');

			const InnovioController = global.SixCRM.routes.include('vendors', 'merchantproviders/Innovio/handler.js');
			let innovio_controller = new InnovioController({merchant_provider: merchant_provider});

			return innovio_controller.refund({transaction: transaction, amount: amount}).then(result => {

				expect(result.getResult()).to.have.property('code');
				expect(result.getResult()).to.have.property('message');
				expect(result.getResult()).to.have.property('response');
				expect(result.getResult().code).to.equal('success');
				expect(result.getResult().message).to.equal('Success');

			});

		});

	});



});
