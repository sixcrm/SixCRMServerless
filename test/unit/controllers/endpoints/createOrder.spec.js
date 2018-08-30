const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');
const expect = chai.expect;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;
const random = require('@6crm/sixcrmcore/util/random').default;
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

function getValidResponseType(){
	return 'success';
}

function getValidProcessorResponse(){

	return {
		code: 'success',
		result: {
			message: "Success",
			result:{
				response:"1",
				responsetext:"SUCCESS",
				authcode:"123456",
				transactionid:"3448894418",
				avsresponse:"N",
				cvvresponse:"",
				orderid:"",
				type:"sale",
				response_code:"100"
			}
		},
		message: 'Some message'
	};

}

function getValidAccountDetails(){
	return MockEntities.getValidAccountDetails();
}


function getValidTransactions(ids){
	return MockEntities.getValidTransactions(ids);
}

function getValidRebill(id){
	return MockEntities.getValidRebill(id);
}

function getValidCustomerPartial(id) {
	const customer = getValidCustomer(id);

	delete customer.firstname;
	delete customer.lastname;
	delete customer.phone;
	delete customer.address;
	delete customer.creditcards;

	return customer;
}

function getValidCustomerPrototype(id){
	const customer = getValidCustomer(id);

	delete customer.id;
	delete customer.account;
	delete customer.created_at;
	delete customer.updated_at;
	delete customer.creditcards;

	return customer;
}

function getValidCustomer(id){
	return MockEntities.getValidCustomer(id);
}

function getValidProductSchedules(ids, expanded){
	return MockEntities.getValidProductSchedules(ids, expanded);
}

function getValidProductScheduleGroups(ids, expanded){
	return MockEntities.getValidProductScheduleGroups(ids, expanded);
}

function getValidTransactionProducts(ids, extended){
	return MockEntities.getValidTransactionProducts(ids, extended);
}

function getValidSession(id){
	return MockEntities.getValidSession(id);
}

function getValidCampaign(id){
	return MockEntities.getValidCampaign(id)
}

function getValidCreditCard(id){
	return MockEntities.getValidPlaintextCreditCard(id)
}

function getValidCreditCardPrototype(){

	let creditcard = MockEntities.getValidTransactionCreditCard();

	return creditcard;

}

function getValidEvent(){

	return {
		resource: '/token/acquire/{account}',
		path: '/token/acquire/d3fa3bf3-7824-49f4-8261-87674482bf1c',
		httpMethod: 'POST',
		headers: {
			'Accept-Encoding': 'gzip, deflate',
			Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE0ODM4MzkyMjR9.jW6hbpILFKRJq1bRN_7XaH1ZrqCT_QK8t4udTrLAgts',
			'CloudFront-Forwarded-Proto': 'https',
			'CloudFront-Is-Desktop-Viewer': 'true',
			'CloudFront-Is-Mobile-Viewer': 'false',
			'CloudFront-Is-SmartTV-Viewer': 'false',
			'CloudFront-Is-Tablet-Viewer': 'false',
			'CloudFront-Viewer-Country': 'US',
			'Content-Type': 'application/json',
			Host: 'development-api.sixcrm.com',
			'User-Agent': 'node-superagent/2.3.0',
			Via: '1.1 e1fff2dee56e3b55796cc594a92413c0.cloudfront.net (CloudFront)',
			'X-Amz-Cf-Id': 'auxn3Iv21qv3qMmcsVjlQxF86zRvidB4jV2XkHx3rdJ94iRatjLc_A==',
			'X-Amzn-Trace-Id': 'Root=1-5a0e3ea9-151c05ec1d5ebffe14d11acf',
			'X-Forwarded-For': '71.193.160.163, 52.46.16.55',
			'X-Forwarded-Port': '443',
			'X-Forwarded-Proto': 'https'
		},
		queryStringParameters: null,
		pathParameters: { account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c' },
		stageVariables: null,
		requestContext:{
			path: '/order/create/d3fa3bf3-7824-49f4-8261-87674482bf1c',
			accountId: '068070110666',
			resourceId: '7s02w8',
			stage: 'development',
			authorizer: {
				principalId: 'user',
				user: '4ee23a8f5c8661612075a89e72a56a3c6d00df90'
			},
			requestId: 'a837419c-cb38-11e7-ad83-af785c8f6952',
			identity:{
				cognitoIdentityPoolId: null,
				accountId: null,
				cognitoIdentityId: null,
				caller: null,
				apiKey: '',
				sourceIp: '71.193.160.163',
				accessKey: null,
				cognitoAuthenticationType: null,
				cognitoAuthenticationProvider: null,
				userArn: null,
				userAgent: 'node-superagent/2.3.0',
				user: null
			},
			resourcePath: '/token/acquire/{account}',
			httpMethod: 'POST',
			apiId: '8jmwnwcaic'
		},
		body: JSON.stringify(getValidEventBody()),
		isBase64Encoded: false
	};

}

function getValidEventBody(ids, expanded){

	return {
		session: getValidSession().id,
		product_schedules: getValidProductScheduleGroups(ids, expanded),
		creditcard: getValidCreditCardPrototype(),
		transaction_subtype:'main',
		products: [{
			quantity: random.randomInt(1, 10),
			price: random.randomDouble(1.00, 100.00, 2),
			product: MockEntities.getValidProduct()
		}]
	};

}

describe('createOrder', function () {

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

	describe('constructor', () => {
		it('successfully constructs', () => {
			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			expect(objectutilities.getClassName(createOrderController)).to.equal('CreateOrderController');
		});
	});

	describe('execute', () => {

		let global_user;

		before(() => {
			global_user = global.user;
		});

		after(() => {
			global.user = global_user;
		});

		it('successfully runs execute method', () => {
			let event = getValidEvent();
			let session = getValidSession();
			let campaign = getValidCampaign();
			let customer = getValidCustomer();
			let stored_creditcard = getValidCreditCard();
			let plaintext_creditcard = getValidCreditCard();
			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let processor_response = getValidProcessorResponse();
			let response_type = 'success';
			let account_details = getValidAccountDetails();

			let user = MockEntities.getValidUser();

			session.completed = false;
			event.body = JSON.stringify(getValidEventBody(null, true));

			mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), class {
				get() {
					return Promise.resolve(session)
				}
				isEmail() {
					return true;
				}
				getUserStrict() {
					return Promise.resolve({});
				}
				getUserByAlias(){
					return Promise.resolve(user);
				}
				setGlobalUser(user){
					global.user = user;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
				get() {
					return Promise.resolve(session)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
				listTransactions() {
					return Promise.resolve({transactions});
				}
				getResult() {
					return Promise.resolve(transactions);
				}
				getPaidStatus() {
					return Promise.resolve('full');
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), class {
				sanitize(sanitization) {
					expect(sanitization).to.be.false;
					return this;
				}
				assureCreditCard() {
					return Promise.resolve(stored_creditcard);
				}
			});

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			let mock_customer = class {
				constructor(){}
				sanitize(){}
				addCreditCard() {
					customer.creditcards.push(stored_creditcard.id);
					stored_creditcard.customers.push(customer.id);
					return Promise.resolve([customer, stored_creditcard]);
				}
				get() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
				constructor(){}
				createRebill(){
					return Promise.resolve(rebill);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor(){}
				updateRebillUpsell() {
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
				constructor(){}
				processTransaction(){
					const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
					let register_response = new RegisterResponse({
						transactions: transactions,
						processor_response: processor_response,
						response_type: response_type,
						creditcard: plaintext_creditcard
					});

					return Promise.resolve(register_response);
				}
				reverseTransaction(){
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: []});
				}
				getResult() {
					return [];
				}
				create({entity}) {
					entity.id = uuidV4();
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = entity.created_at;
					entity.account = global.account;
					return Promise.resolve(entity);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve();
				}
				getRegion() {
					return 'localhost'
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(){
					return Promise.resolve(true);
				}
			});

			let mock_account_details = class {
				constructor(){}

				get () {
					return Promise.resolve(account_details);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'AccountDetails.js'), mock_account_details);
			//PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return createOrderController.execute(event).then(() => {
				expect(createOrderController.parameters.store).to.have.property('info');
				let info = createOrderController.parameters.get('info');
				expect(global.SixCRM.validate(info, global.SixCRM.routes.path('model', 'endpoints/createOrder/info.json'))).to.equal(true);
			});

		});

		it('successfully runs execute method if required customer fields provided', () => {

			let event = getValidEvent();
			let session = getValidSession();
			let campaign = getValidCampaign();

			session.completed = false;
			let eventBody = getValidEventBody(null, true);
			eventBody.customer = getValidCustomerPrototype();
			event.body = JSON.stringify(eventBody);

			let customer = getValidCustomerPartial();
			let stored_creditcard = getValidCreditCard();
			let plaintext_creditcard = getValidCreditCard();
			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let processor_response = getValidProcessorResponse();
			let response_type = 'success';
			let account_details = getValidAccountDetails();

			let user = MockEntities.getValidUser();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), class {
				get() {
					return Promise.resolve(session)
				}
				isEmail() {
					return true;
				}
				getUserStrict() {
					return Promise.resolve({});
				}
				getUserByAlias(){
					return Promise.resolve(user);
				}
				setGlobalUser(user){
					global.user = user;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
				get() {
					return Promise.resolve(session)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
				listTransactions() {
					return Promise.resolve({transactions});
				}
				getResult() {
					return Promise.resolve(transactions);
				}
				getPaidStatus() {
					return Promise.resolve('full');
				}
			});

			const CreditCard = global.SixCRM.routes.include('entities','CreditCard.js');
			CreditCard.prototype.queryBySecondaryIndex = () => { return Promise.resolve({creditcards: []}); };
			CreditCard.prototype.create = ({entity}) => {
				expect(entity).to.be.defined;
				return Promise.resolve(stored_creditcard);
			};

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			let mock_customer = class {
				constructor(){}
				sanitize(){}
				addCreditCard() {
					customer.creditcards = [stored_creditcard.id];
					stored_creditcard.customers = [customer.id];
					return Promise.resolve([customer, stored_creditcard]);
				}
				get() {
					return Promise.resolve(customer);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
				constructor(){}
				createRebill(){
					return Promise.resolve(rebill);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor(){}
				createRebill({session, product_schedules}){
					rebill.product_schedules = product_schedules;
					rebill.parentsession = session.id
					return Promise.resolve(rebill);
				}
				updateRebillUpsell(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
				constructor(){}
				processTransaction(){
					const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
					let register_response = new RegisterResponse({
						transactions: transactions,
						processor_response: processor_response,
						response_type: response_type,
						creditcard: plaintext_creditcard
					});

					return Promise.resolve(register_response);
				}
				reverseTransaction(){
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: []});
				}
				getResult() {
					return [];
				}
				create({entity}) {
					entity.id = uuidV4();
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = entity.created_at;
					entity.account = global.account;
					return Promise.resolve(entity);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve();
				}
				getRegion() {
					return 'localhost'
				}
			});

			let mock_account_details = class {
				constructor(){}

				get () {
					return Promise.resolve(account_details);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'AccountDetails.js'), mock_account_details);

			//PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');
			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(){
					return Promise.resolve(true);
				}
			});

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return createOrderController.execute(event).then(() => {
				expect(createOrderController.parameters.store).to.have.property('info');
				let info = createOrderController.parameters.get('info');
				expect(global.SixCRM.validate(info, global.SixCRM.routes.path('model', 'endpoints/createOrder/info.json'))).to.equal(true);
			});

		});

		it('successfully runs execute method in the absence of a event creditcard (upsell)', () => {

			let event = getValidEvent();

			delete event.creditcard;
			event.transaction_subtype = 'upsell';
			event.body = JSON.stringify(getValidEventBody(null, true));

			let session = getValidSession();
			let campaign = getValidCampaign();

			session.completed = false;

			let customer = getValidCustomer();
			let stored_creditcard = getValidCreditCard();
			let plaintext_creditcard = getValidCreditCard();
			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let processor_response = getValidProcessorResponse();
			let response_type = 'success';
			let account_details = getValidAccountDetails();

			let user = MockEntities.getValidUser();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), class {
				get() {
					return Promise.resolve(session)
				}
				isEmail() {
					return true;
				}
				getUserStrict() {
					return Promise.resolve({});
				}
				getUserByAlias(){
					return Promise.resolve(user);
				}
				setGlobalUser(user){
					global.user = user;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
				get() {
					return Promise.resolve(session)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
				listTransactions() {
					return Promise.resolve({transactions});
				}
				getResult() {
					return Promise.resolve(transactions);
				}
				getPaidStatus() {
					return Promise.resolve('full');
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
				constructor(){}
				createRebill(){
					return Promise.resolve(rebill);
				}
			});

			const CreditCard = global.SixCRM.routes.include('entities','CreditCard.js');
			CreditCard.prototype.queryBySecondaryIndex = () => { return Promise.resolve({creditcards: []}); };
			CreditCard.prototype.create = ({entity}) => {
				expect(entity).to.be.defined;
				return Promise.resolve(stored_creditcard);
			};

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			let mock_customer = class {
				constructor(){}
				sanitize(){}
				addCreditCard() {
					customer.creditcards.push(stored_creditcard.id);
					stored_creditcard.customers.push(customer.id);
					return Promise.resolve([customer, stored_creditcard]);
				}
				get() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor(){}
				createRebill({session, product_schedules}){
					rebill.product_schedules = product_schedules;
					rebill.parentsession = session.id
					return Promise.resolve(rebill);
				}
				updateRebillUpsell(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
				constructor(){}
				processTransaction(){
					const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
					let register_response = new RegisterResponse({
						transactions: transactions,
						processor_response: processor_response,
						response_type: response_type,
						creditcard: plaintext_creditcard
					});

					return Promise.resolve(register_response);
				}
				reverseTransaction(){
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: []});
				}
				getResult() {
					return [];
				}
				create({entity}) {
					entity.id = uuidV4();
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = entity.created_at;
					entity.account = global.account;
					return Promise.resolve(entity);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve();
				}
				getRegion() {
					return 'localhost'
				}
			});

			//PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(){
					return Promise.resolve(true);
				}
			});

			let mock_account_details = class {
				constructor(){}

				get () {
					return Promise.resolve(account_details);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'AccountDetails.js'), mock_account_details);

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return createOrderController.execute(event).then(() => {
				expect(createOrderController.parameters.store).to.have.property('info');
				let info = createOrderController.parameters.get('info');
				expect(global.SixCRM.validate(info, global.SixCRM.routes.path('model', 'endpoints/createOrder/info.json'))).to.equal(true);
			});
		});

	});

	describe('hydrateSession', () => {

		it('successfully gets event session property', () => {

			let session = getValidSession();
			let event = getValidEventBody();

			event.session = session.id;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				get() {
					return Promise.resolve(session)
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			createOrderController.parameters.set('event', event);

			return createOrderController.hydrateSession(event).then(result => {
				expect(result).to.deep.equal(session);
			});

		});

	});

	describe('validateSession', () => {

		it('successfully validates a session', () => {

			let session = getValidSession();

			session.completed = false;

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return createOrderController.validateSession(session);

		});

		it('throws an error if the session is closed', () => {

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			let session = getValidSession();

			session.completed = true;

			try {
				createOrderController.validateSession(session);
			}catch(error){
				expect(error.message).to.equal('[400] The session is already complete.');
			}

		});

		it('throws an error if the session is expired', () => {

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			let session = getValidSession();

			session.completed = false;
			session.created_at = timestamp.toISO8601((timestamp.createTimestampSeconds() - 3610));

			try {
				createOrderController.validateSession(session);
			} catch (error) {
				expect(error.message).to.equal('[400] Session has expired.');
			}

		});

	});

	describe('createRebill', () => {

		it('successfully creates the order rebill', () => {

			let session = getValidSession();
			let product_schedules = getValidProductScheduleGroups();
			let transaction_products = getValidTransactionProducts(null, true);

			let rebill = getValidRebill();

			rebill.products = transaction_products;
			rebill.product_schedules = arrayutilities.map(getValidProductScheduleGroups(), product_schedule_group => product_schedule_group.product_schedule);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
				constructor(){}
				createRebill(){
					return Promise.resolve(rebill);
				}
			});

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return createOrderController.createRebill(session, product_schedules, transaction_products).then(result => {
				expect(result).to.deep.equal(rebill);
			});
		});

		it('throws an error if no products could be found', () => {
			let session = getValidSession();
			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			expect(() => {
				createOrderController.createRebill(session);
			}).to.throw('[500] Nothing to add to the rebill.');

		});

	});

	describe('processRebill', () => {

		it('successfully processes a rebill', () => {

			let rebill = getValidRebill();
			let processor_response = getValidProcessorResponse();
			let response_type = getValidResponseType();
			let plaintext_creditcard = getValidCreditCard();
			let transactions = getValidTransactions();

			const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
			let register_response = new RegisterResponse({
				transactions: transactions,
				processor_response: processor_response,
				response_type: response_type,
				creditcard: plaintext_creditcard
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
				constructor(){}
				processTransaction(){
					return Promise.resolve(register_response);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: []});
				}
				getResult() {
					return [];
				}
				create({entity}) {
					entity.id = uuidV4();
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = entity.created_at;
					entity.account = global.account;
					return Promise.resolve(entity);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				constructor(){}
				async update(){}
			});

			let TransactionHelperController = global.SixCRM.routes.include('helpers', 'entities/transaction/Transaction.js');
			const transactionHelperController = new TransactionHelperController();

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return createOrderController.processRebill(rebill, {}).then(result => {
				expect(result).to.deep.equal({
					creditcard: plaintext_creditcard,
					transactions: transactions,
					result: response_type,
					amount: transactionHelperController.getTransactionsAmount(transactions)
				});


			});

		});

	});

	describe('postProcessing', () => {

		it('successfully executes post processing methods', () => {

			let rebill = getValidRebill();
			let session = getValidSession();
			let product_schedules = getValidProductScheduleGroups(null, true);
			let product_groups = getValidTransactionProducts(null, true);
			let transactions = getValidTransactions();

			PermissionTestGenerators.givenAnyUser();

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor(){}
				updateRebillUpsell(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				update({entity}){
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: []});
				}
				getResult() {
					return [];
				}
				create({entity}) {
					entity.id = uuidV4();
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = entity.created_at;
					entity.account = global.account;
					return Promise.resolve(entity);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve();
				}
				getRegion() {
					return 'localhost'
				}
			});

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return Promise.all([
				createOrderController.reversePreviousRebill(rebill),
				createOrderController.incrementMerchantProviderSummary(transactions),
				createOrderController.updateSessionWithWatermark(session, product_schedules, product_groups),
			]);
		});

		it('handles no watermark products', () => {

			let rebill = getValidRebill();
			let session = getValidSession();
			delete session.watermark;
			let product_schedules = getValidProductScheduleGroups(null, true);
			let product_groups = getValidTransactionProducts(null, true);
			let transactions = getValidTransactions();

			PermissionTestGenerators.givenAnyUser();

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor(){}
				updateRebillUpsell(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				update({entity}){
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: []});
				}
				getResult() {
					return [];
				}
				create({entity}) {
					entity.id = uuidV4();
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = entity.created_at;
					entity.account = global.account;
					return Promise.resolve(entity);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve();
				}
				getRegion() {
					return 'localhost'
				}
			});

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return Promise.all([
				createOrderController.reversePreviousRebill(rebill),
				createOrderController.incrementMerchantProviderSummary(transactions),
				createOrderController.updateSessionWithWatermark(session, product_schedules, product_groups)
			]);
		});

		it('handles no watermark product schedules', () => {

			let rebill = getValidRebill();
			let session = getValidSession();
			delete session.watermark.product_schedules;
			let product_schedules = getValidProductScheduleGroups(null, true);
			let product_groups = getValidTransactionProducts(null, true);
			let transactions = getValidTransactions();

			PermissionTestGenerators.givenAnyUser();

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor(){}
				updateRebillUpsell(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				update({entity}){
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: []});
				}
				getResult() {
					return [];
				}
				create({entity}) {
					entity.id = uuidV4();
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = entity.created_at;
					entity.account = global.account;
					return Promise.resolve(entity);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve();
				}
				getRegion() {
					return 'localhost'
				}
			});

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return Promise.all([
				createOrderController.reversePreviousRebill(rebill),
				createOrderController.incrementMerchantProviderSummary(transactions),
				createOrderController.updateSessionWithWatermark(session, product_schedules, product_groups)
			]);

		});

		it('marks rebill as no_process if register result unsuccessful', async () => {

			let rebill = getValidRebill();
			let session = getValidSession();
			let product_schedules = getValidProductScheduleGroups(null, true);
			let product_groups = getValidTransactionProducts(null, true);
			let transactions = getValidTransactions();

			PermissionTestGenerators.givenAnyUser();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update() {
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				update({entity}){
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: []});
				}
				getResult() {
					return [];
				}
				create({entity}) {
					entity.id = uuidV4();
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = entity.created_at;
					entity.account = global.account;
					return Promise.resolve(entity);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve();
				}
				getRegion() {
					return 'localhost'
				}
			});

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			await Promise.all([
				createOrderController.reversePreviousRebill(rebill),
				createOrderController.incrementMerchantProviderSummary(transactions),
				createOrderController.updateSessionWithWatermark(session, product_schedules, product_groups),
				createOrderController.markNonSuccessfulRebill('decline', rebill),
			]);

			expect(rebill.no_process).to.be.true;

		});

	});

	describe('getCreditCard', () => {

		it('successfully gets a creditcard', () => {

			let event = getValidEventBody();
			let customer = getValidCustomer();

			const CreditCard = global.SixCRM.routes.include('entities','CreditCard.js');
			CreditCard.prototype.queryBySecondaryIndex = () => { return Promise.resolve({creditcards: []}); };
			CreditCard.prototype.create = ({entity}) => {
				entity.first_six = entity.number.substring(0,6);
				entity.last_four = entity.number.slice(-4);
				entity.id = MockEntities.getValidId();
				entity.created_at = timestamp.getISO8601();
				entity.updated_at = entity.created_at;
				entity.account = MockEntities.getValidId();
				entity.token = {
					token:'sometokenstring',
					provider: 'tokenex'
				}

				return Promise.resolve(entity);

			};
			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), CreditCard);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), class {
				constructor(){}
				sanitize(){}
				addCreditCard(a_customer, a_creditcard) {
					customer.creditcards.push(a_creditcard.id);
					a_creditcard.customers = [customer.id];
					return Promise.resolve([customer, a_creditcard]);
				}
			});

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			createOrderController.parameters.set('event', event);

			return createOrderController.getCreditCard(event, customer).then(result => {
				delete result.id;
				delete result.created_at;
				delete result.updated_at;
				delete result.account;
				delete result.customers;
				expect(result).to.deep.equal(event.creditcard);
			})

		});

		it('successfully skips when creditcard is not set', () => {

			let event = getValidEventBody();

			delete event.creditcard;

			let mock_credit_card = class {
				constructor(){}

				assureCreditCard () {
					throw new Error()
				}
				sanitize(sanitization) {
					expect(sanitization).to.be.false;
					return this;
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), mock_credit_card);

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			createOrderController.parameters.set('event', event);

			return createOrderController.getCreditCard(event).then(result => {
				expect(result).to.be.undefined;
			});

		});
	});

	describe('getCampaign', () => {

		it('successfully gets the campaign', () => {

			let campaign = getValidCampaign();

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return createOrderController.getCampaign(getValidSession()).then(result => {
				expect(result).to.deep.equal(campaign);
			});

		});

	});

	describe('getCustomer', () => {

		it('successfully gets a customer', () => {

			let event = getValidEventBody();
			let customer = getValidCustomer();

			let mock_customer = class {
				constructor(){}
				sanitize(){}
				get() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			createOrderController.parameters.set('event', event);

			return createOrderController.getCustomer(event, getValidSession()).then(result => {
				expect(result).to.deep.equal(customer);
			});

		});

		it('updates customer with properties from event', () => {
			let event = getValidEventBody();
			const customer = getValidCustomerPartial();

			let mock_customer = class {
				constructor(){}
				sanitize(){}
				get() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			createOrderController.parameters.set('event', event);

			return createOrderController.getCustomer(event, getValidSession())
				.catch(error => {
					expect(error.name).to.equal('Server Error');
				});
		});

		it('fails if customer is not processable', () => {
			let event = getValidEventBody();
			const customer = getValidCustomerPartial();

			let mock_customer = class {
				constructor(){}
				sanitize(){}
				get() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			createOrderController.parameters.set('event', event);

			return createOrderController.getCustomer(event, getValidSession())
				.catch(error => {
					expect(error.name).to.equal('Server Error');
				});
		});
	});

	describe('getPreviousRebill', () => {

		it('retrieves rebill', () => {
			const event = getValidEventBody();
			const rebill = getValidRebill();

			event.reverse_on_complete = rebill.alias;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				getByAlias({alias}) {
					expect(alias).to.equal(rebill.alias);
					return Promise.resolve(rebill);
				}
			});

			const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			createOrderController.parameters.set('event', event);

			return createOrderController.getPreviousRebill(event).then((result) => {
				expect(result).to.equal(rebill);
			});
		});

		it('resolves immediately if no previous rebill', () => {
			const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			const event = getValidEventBody();
			createOrderController.parameters.set('event', event);

			return createOrderController.getPreviousRebill(event).then((result) => {
				expect(result).to.be.undefined;
			});
		});
	});

	describe('reversePreviousRebill', () => {
		it('resolves immediately if no previous rebill', () => {
			const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			createOrderController.parameters.set('rebill', getValidRebill());
			return createOrderController.reversePreviousRebill();
		});

		it('reverses all associated transactions', () => {
			const rebill = getValidRebill();
			const previous_rebill = getValidRebill();
			const transactions = getValidTransactions();
			const reversed_transactions = [];

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				updateRebillUpsell({rebill: _rebill, upsell}) {
					expect(_rebill).to.equal(previous_rebill);
					expect(upsell).to.equal(rebill);
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				listTransactions(rebill) {
					expect(rebill).to.equal(previous_rebill);
					return Promise.resolve({transactions});
				}
				getResult(result, field) {
					return Promise.resolve(result[field]);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
				reverseTransaction({transaction}) {
					reversed_transactions.push(transaction);
					return Promise.resolve();
				}
			});

			const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return createOrderController.reversePreviousRebill(rebill, previous_rebill)
				.then(() => {
					expect(reversed_transactions).to.deep.equal(transactions);
				});
		});
	});

	describe('updateRebillPaidStatus', () => {
		it('updates rebill paid attribute', () => {
			const rebill = getValidRebill();
			const transactions = getValidTransactions();


			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				async getPaidStatus(_rebill, _transactions) {
					expect(_rebill).to.equal(rebill);
					expect(_transactions).to.deep.equal(transactions);
					return 'paid';
				}
				async update({entity}) {
					expect(entity.paid.detail).to.equal('paid');
					expect(entity.paid).to.have.property('updated_at');
					return;
				}
			});

			const CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			return createOrderController.updateRebillPaidStatus(rebill, transactions);
		});
	});

	describe('createOrder', () => {
		it('successfully creates a order', () => {

			let event = getValidEventBody(null, true);
			let product_schedule_ids = arrayutilities.map(event.product_schedules, product_schedule_group => product_schedule_group.product_schedule);
			let product_schedules = getValidProductSchedules(product_schedule_ids, true);
			let session = getValidSession();
			let campaign = getValidCampaign();
			let customer = getValidCustomer();
			let stored_creditcard = getValidCreditCard();
			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let processor_response = getValidProcessorResponse();
			let response_type = 'success';
			let account_details = getValidAccountDetails();

			session.completed = false;

			mockery.registerMock(global.SixCRM.routes.path('helpers','entities/productschedule/ProductSchedule.js'), class {
				constructor(){}
				getHydrated({id}){
					return Promise.resolve(arrayutilities.find(product_schedules, product_schedule => { return product_schedule.id == id }));
				}
				getNextScheduleElementStartDayNumber(){
					return 0;
				}
				getScheduleElementOnDayInSchedule(){
					return 0;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
				get() {
					return Promise.resolve(session)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				update({entity}) {
					return Promise.resolve(entity);
				}
				listTransactions() {
					return Promise.resolve({transactions});
				}
				getResult() {
					return Promise.resolve(transactions);
				}
				getPaidStatus() {
					return Promise.resolve('full');
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), class {
				sanitize(sanitization) {
					expect(sanitization).to.be.false;
					return this;
				}
				assureCreditCard() {
					return Promise.resolve(stored_creditcard);
				}
			});

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			let mock_customer = class {
				constructor(){}
				sanitize(){}
				addCreditCard() {
					customer.creditcards.push(stored_creditcard.id);
					stored_creditcard.customers.push(customer.id);
					return Promise.resolve([customer, stored_creditcard]);
				}
				get() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/RebillCreator.js'), class {
				constructor(){}
				createRebill(){
					return Promise.resolve(rebill);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor(){}
				updateRebillUpsell() {
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
				constructor(){}
				processTransaction(){
					const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
					let register_response = new RegisterResponse({
						transactions: transactions,
						processor_response: processor_response,
						response_type: response_type,
						creditcard: stored_creditcard
					});

					return Promise.resolve(register_response);
				}
				reverseTransaction(){
					return Promise.resolve();
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'MerchantProviderSummary.js'), class {
				listByMerchantProviderAndDateRange() {
					return Promise.resolve({merchantprovidersummaries: []});
				}
				getResult() {
					return [];
				}
				create({entity}) {
					entity.id = uuidV4();
					entity.created_at = timestamp.getISO8601();
					entity.updated_at = entity.created_at;
					entity.account = global.account;
					return Promise.resolve(entity);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve();
				}
				getRegion() {
					return 'localhost'
				}
			});

			let mock_account_details = class {
				constructor(){}

				get () {
					return Promise.resolve(account_details);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'AccountDetails.js'), mock_account_details);

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let CreateOrderController = global.SixCRM.routes.include('controllers', 'endpoints/createOrder.js');
			const createOrderController = new CreateOrderController();

			createOrderController.parameters.set('event', event);

			return createOrderController.createOrder(event).then(() => {
				let info = createOrderController.parameters.get('info');
				expect(global.SixCRM.validate(info, global.SixCRM.routes.path('model', 'endpoints/createOrder/info.json'))).to.equal(true);
			});

		});

	});

});
