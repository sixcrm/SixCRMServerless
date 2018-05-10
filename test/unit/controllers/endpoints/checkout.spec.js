

const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidCustomer(){
	return MockEntities.getValidCustomer();
}

function getValidEvent(){

	return {
		resource: '/checkout/{account}',
		path: '/checkout/d3fa3bf3-7824-49f4-8261-87674482bf1c',
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
			path: '/checkout/d3fa3bf3-7824-49f4-8261-87674482bf1c',
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
			resourcePath: '/checkout/{account}',
			httpMethod: 'POST',
			apiId: '8jmwnwcaic'
		},
		body: JSON.stringify(getValidEventBody()),
		isBase64Encoded: false
	};

}

function getValidEventBody(ids, expanded){

	return {
		customer: getValidCustomerPrototype(),
		affiliates: getValidAffiliatesPrototype(),
		campaign: getValidCampaign().id,
		product_schedules: arrayutilities.map(MockEntities.getValidProductSchedules(ids, expanded), product_schedule => {
			return {quantity: 1, product_schedule: product_schedule};
		}),
		creditcard: getValidCreditCardPrototype()
	};

}

function getValidCampaign(){
	return MockEntities.getValidCampaign();
}

function getValidCreditCard(){
	return MockEntities.getValidPlaintextCreditCard();
}

function getValidCreditCardPrototype(){

	let creditcard = MockEntities.getValidTransactionCreditCard();

	return creditcard;

}

function getValidProductSchedules(){
	return MockEntities.getValidProductSchedules();
}

function getValidProductSchedule(id, expanded){
	return MockEntities.getValidProductSchedule(id, expanded);
}

function getValidSession(){
	return MockEntities.getValidSession();
}

function getValidCustomerPrototype(){

	let customer = MockEntities.getValidCustomer();

	delete customer.id;
	delete customer.created_at;
	delete customer.updated_at;
	delete customer.account;
	return customer;

}

function getValidAffiliates(){
	return {
		affiliate: uuidV4(),
		subaffiliate_1: uuidV4(),
		subaffiliate_2: uuidV4(),
		subaffiliate_3: uuidV4(),
		subaffiliate_4: uuidV4(),
		subaffiliate_5: uuidV4(),
		cid: uuidV4()
	};
}

function getValidAffiliatesPrototype(){

	return {
		affiliate: randomutilities.createRandomString(20),
		subaffiliate_1: randomutilities.createRandomString(20),
		subaffiliate_2: randomutilities.createRandomString(20),
		subaffiliate_3: randomutilities.createRandomString(20),
		subaffiliate_4: randomutilities.createRandomString(20),
		subaffiliate_5: randomutilities.createRandomString(20),
		cid: randomutilities.createRandomString(20)
	};

}

function getValidRebill(){
	return MockEntities.getValidRebill();
}

function getValidTransactions(){
	return MockEntities.getValidTransactions();
}

function getValidTransactionProducts(ids, expanded){
	return MockEntities.getValidTransactionProducts(ids, expanded);
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

function getValidConfirmation(){

	let session = getValidSession();
	delete session.account;

	let customer = getValidCustomer();
	delete customer.account;
	delete customer.credit_cards;

	return {
		orders: [
			MockEntities.getValidOrder()
		],
		session: getValidSession(),
		customer: getValidCustomer()
	};

}

describe('checkout', function () {
	before(() => {
		global.account = 'd3fa3bf3-7824-49f4-8261-87674482bf1c';
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

			let CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
			const checkoutController = new CheckoutController();

			expect(objectutilities.getClassName(checkoutController)).to.equal('CheckoutController');

		});

	});

	describe('createLead', () => {

		it('successfully creates a lead', () => {

			let event_body = getValidEventBody();
			let affiliates = getValidAffiliates();
			let campaign = getValidCampaign();
			let session = getValidSession();
			let customer = getValidCustomer();

			let mock_customer = class {
				constructor(){}
				sanitize(){}
				getCustomerByEmail() {
					return Promise.resolve(null);
				}
				create() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			let affiliates_helper_mock = class {
				constructor(){}
				handleAffiliateInformation(a_event){
					let cloned_event = objectutilities.clone(a_event);

					cloned_event.affiliates = affiliates;
					return Promise.resolve(cloned_event);
				}
				transcribeAffiliates(){
					return {};
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), affiliates_helper_mock);

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve({});
				}
				getRegion() {
					return 'localhost';
				}
			});

			let mock_tracker_helper_controller = class {
				constructor(){ }
				handleTracking(id, info){
					return Promise.resolve(info);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tracker/Tracker.js'), mock_tracker_helper_controller);

			let mock_email_helper = class {
				constructor(){}
				sendEmail(){
					return Promise.resolve(true);
				}
			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'user/Email.js'), mock_email_helper);

			mockery.registerMock(global.SixCRM.routes.path('providers', 'notification/Notification.js'), class {
				createNotificationsForAccount() {
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				assureSession() {
					return Promise.resolve(session);
				}
				getCampaign() {
					return Promise.resolve(campaign);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
			const checkoutController = new CheckoutController();

			checkoutController.parameters.set('event', event_body);

			return checkoutController.createLead().then(result => {
				expect(result).to.equal(true);
				delete session.account;
				delete session.product_schedules;
				expect(checkoutController.parameters.store['session']).to.deep.equal(session);
			});

		});

	});

	describe('createOrder', () => {

		it('successfully creates a order', () => {

			let event = getValidEventBody(null, true);
			let session = getValidSession();

			session.completed = false;
			let campaign = getValidCampaign();
			let customer = getValidCustomer();
			let creditcard = getValidCreditCard();
			let product_schedule_ids = arrayutilities.map(event.product_schedules, product_schedule_group => product_schedule_group.product_schedule);
			let product_schedule = getValidProductSchedule(product_schedule_ids, true);

			event.session = session.id;
			customer.creditcards = [creditcard.id];

			let rebill = getValidRebill();
			let transactions = getValidTransactions();
			let processor_response = getValidProcessorResponse();
			let response_type = 'success';

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/productschedule/ProductSchedule.js'), class {
				getHydrated(){
					return Promise.resolve(product_schedule);
				}
				getNextScheduleElementStartDayNumber(){
					return 0;
				}
				getScheduleElementOnDayInSchedule({product_schedule}){
					return product_schedule[0];
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve({});
				}
				getRegion() {
					return 'localhost';
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
			});

			let mock_credit_card = class {
				constructor(){}

				assureCreditCard() {
					return Promise.resolve(creditcard);
				}

				sanitize(input) {
					expect(input).to.equal(false);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'CreditCard.js'), mock_credit_card);

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
					customer.creditcards.push(creditcard.id);
			  creditcard.customers.push(customer.id);
					return Promise.resolve([customer, creditcard]);
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

			let mock_rebill_helper = class {

				constructor(){

				}

				calculateAmount(){
					return randomutilities.randomDouble(1.00, 100.00);
				}

				addRebillToQueue(){
					return Promise.resolve(true);
				}

				updateRebillState(){
					return Promise.resolve(true);
				}

			}

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), mock_rebill_helper);

			mockery.registerMock(global.SixCRM.routes.path('providers', 'register/Register.js'), class {
				constructor(){}
				processTransaction(){
					const RegisterResponse = global.SixCRM.routes.include('providers', 'register/Response.js');
					let register_response = new RegisterResponse({
						transactions: transactions,
						processor_response: processor_response,
						response_type: response_type,
						creditcard: creditcard
					});

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

			let CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
			const checkoutController = new CheckoutController();

			checkoutController.parameters.set('event', event);

			return checkoutController.createOrder().then(result => {
				expect(result).to.equal(true);
				expect(checkoutController.parameters.store['order']).to.be.defined;
			});

		});

	});

	describe('confirmOrder', () => {

		it('successfully confirms a order', () => {
			let event = getValidEventBody();
			let session = getValidSession();
			let campaign = getValidCampaign();

			session.completed = false;
			event.session = session.id;

			let transactions = getValidTransactions();
			let products = getValidTransactionProducts(null, true);
			let customer = getValidCustomer();
			let rebill = MockEntities.getValidRebill();
			rebill.parentsession = session.id;
			let rebills = [rebill];

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
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				get() {
					return Promise.resolve(session);
				}
				getCustomer() {
					return Promise.resolve(customer);
				}
				listTransactions() {
					return Promise.resolve(transactions);
				}
				closeSession() {
					return Promise.resolve(true);
				}
				getCampaign() {
					return Promise.resolve(campaign);
				}
				listRebills(session) {
					expect(session).to.be.defined;
					return Promise.resolve(rebills);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/transaction/Transaction.js'), class {
				constructor(){}
				getTransactionProducts(){
					return products;
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				getResult(obj, key) {
					return obj[key];
				}
				listTransactions() {
					return Promise.resolve(transactions);
				}
				getParentSession() {
					return Promise.resolve(session);
				}
				getCustomer() {
					return Promise.resolve(customer);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve({});
				}
				getRegion() {
					return 'localhost';
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
			const checkoutController = new CheckoutController();

			checkoutController.parameters.set('event', event);

			return checkoutController.confirmOrder(event).then(result => {
				expect(result).to.equal(true);
				expect(checkoutController.parameters.store['confirmation']).to.be.defined;
			});

		});

	});

	describe('setSession', () => {

		it('successfully sets the session property in the event', () => {

			let event_body = getValidEventBody();
			let session = getValidSession();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve({});
				}
				getRegion() {
					return 'localhost';
				}
			});

			let CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
			const checkoutController = new CheckoutController();

			checkoutController.parameters.set('event', event_body);
			checkoutController.parameters.set('session', session);

			return checkoutController.setSession().then(result => {
				expect(result).to.equal(true);
				expect(checkoutController.parameters.store['event'].session).to.equal(session.id);
			});

		});

	});

	describe('postProcessing', () => {

		it('successfully executes all post processing functions', () => {

			let confirmation = getValidConfirmation();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve({});
				}
				getRegion() {
					return 'localhost';
				}
			});

			let CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
			const checkoutController = new CheckoutController();

			checkoutController.parameters.set('confirmation', confirmation);

		});

	});

	describe('execute', () => {

		let global_user;

		beforeEach(() => {
			global_user = global.user;
		});

		afterEach(() => {
			mockery.resetCache();
			mockery.deregisterAll();
			global.user = global_user;
		});

		it('successfully executes a checkout event', () => {

			let event = getValidEvent();
			let affiliates = getValidAffiliates();
			let campaign = getValidCampaign();
			let session = getValidSession();


			let rebill = MockEntities.getValidRebill();
			rebill.parentsession = session.id;
			let rebills = [rebill];


			//event.body = JSON.stringify(getValidEventBody(null, true));
			session.completed = false;
			let customer = getValidCustomer();

			customer.creditcards = [];

			let stored_creditcard = getValidCreditCard();
			let transactions = getValidTransactions();
			let processor_response = getValidProcessorResponse();
			let response_type = 'success';
			let product_schedules = getValidProductSchedules(null, true);
			let user = MockEntities.getValidUser();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
				publish() {
					return Promise.resolve({});
				}
				getRegion() {
					return 'localhost';
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/productschedule/ProductSchedule.js'), class {
				getHydrated(){
					return Promise.resolve(product_schedules);
				}
				getNextScheduleElementStartDayNumber(){
					return 0;
				}
				getScheduleElementOnDayInSchedule({product_schedule}){
					return product_schedule[0];
				}
			});

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

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), class {
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
				getCustomerByEmail() {
					return Promise.resolve(null);
				}
				create() {
					return Promise.resolve(customer);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), class {
				constructor(){}
				handleAffiliateInformation(a_event){
					let cloned_event = objectutilities.clone(a_event);

					cloned_event.affiliates = affiliates;
					return Promise.resolve(cloned_event);
				}
				transcribeAffiliates(){
					return {};
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), class {
				constructor(){}
				get () {
					return Promise.resolve(campaign);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/tracker/Tracker.js'), class {
				constructor(){ }
				handleTracking(id, info){
					return Promise.resolve(info);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'user/Email.js'), class {
				constructor(){}
				sendEmail(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('providers', 'notification/Notification.js'), class {
				createNotificationsForAccount() {
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				assureSession() {
					return Promise.resolve(session);
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
				get() {
					return Promise.resolve(session)
				}
				getCustomer() {
					return Promise.resolve(customer);
				}
				listTransactions() {
					return Promise.resolve(transactions);
				}
				closeSession() {
					return Promise.resolve(true);
				}
				getCampaign() {
					return Promise.resolve(campaign);
				}
				listRebills(session){
					expect(session).to.be.defined;
					return Promise.resolve(rebills);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Rebill.js'), class {
				getResult(obj, key) {
					return obj[key];
				}
				update({entity}) {
					return Promise.resolve(entity);
				}
				listTransactions(rebill){
					expect(rebill).to.be.defined;
					return Promise.resolve({transactions});
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

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/rebill/Rebill.js'), class {
				constructor(){}
				createRebill({session, product_schedules}){
					rebill.product_schedules = product_schedules;
					rebill.parentsession = session.id
					return Promise.resolve(rebill);
				}
				addRebillToQueue(){
					return Promise.resolve(true);
				}
				updateRebillState(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(){
					return Promise.resolve(true);
				}
			});

			//PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let CheckoutController = global.SixCRM.routes.include('controllers', 'endpoints/checkout.js');
			const checkoutController = new CheckoutController();

			return checkoutController.execute(event).then(()=> {
				expect(checkoutController.parameters.store['confirmation']).to.be.defined;
			});

		});

	});

});
