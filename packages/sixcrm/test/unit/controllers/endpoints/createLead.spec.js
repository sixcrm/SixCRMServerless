const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const randomutilities = require('@6crm/sixcrmcore/lib/util/random').default;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;

const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidCustomer(){
	return MockEntities.getValidCustomer();
}

function getLocalEvent(){
	return JSON.stringify(getValidEvent());
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
			path: '/lead/create/d3fa3bf3-7824-49f4-8261-87674482bf1c',
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

function getValidEventBody(){

	return {
		customer: getValidCustomerPrototype(),
		affiliates: getValidAffiliatesPrototype(),
		campaign: getValidCampaign().id
	};

}

function getValidCampaign(){

	return MockEntities.getValidCampaign();

}

function getValidSession(){

	return MockEntities.getValidSession();

}

function getValidSessionPrototype(){

	let session = objectutilities.clone(getValidSession());

	delete session.id;
	delete session.account;
	delete session.product_schedules;
	delete session.created_at;
	delete session.updated_at;
	return session;

}

function getValidCustomerPrototype(){

	let customer = MockEntities.getValidCustomer();

	delete customer.id;
	delete customer.created_at;
	delete customer.updated_at;
	delete customer.account;
	delete customer.firstname;
	delete customer.lastname;
	delete customer.phone;
	delete customer.address;
	delete customer.creditcards;

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

describe('createLead', function () {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {

		mockery.registerMock(global.SixCRM.routes.path('helpers', 'statemachine/StateMachine.js'), class {
			constructor(){}
			startExecution({parameters}){
				expect(parameters).to.be.a('object');
				expect(parameters).to.have.property('stateMachineName');
				expect(parameters).to.have.property('input');
				expect(parameters).to.have.property('account');
				expect(parameters.stateMachineName).to.equal('Closesession');
				return Promise.resolve(true);
			}
		});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			getRegion() {}
			publish() {}
		});
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

	describe('constructor', () => {
		it('successfully constructs', () => {
			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			expect(objectutilities.getClassName(createLeadController)).to.equal('CreateLeadController');
		});
	});

	describe('execute', () => {

		let global_user;

		beforeEach(() => {
			global_user = global.user;
		});

		afterEach(() => {
			global.user = global_user;
		});

		it('successfully executes', () => {

			let event = getValidEvent();
			let customer = getValidCustomer();
			let affiliates = getValidAffiliates();
			let campaign = getValidCampaign();
			let session = getValidSession();
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

			let mock_customer = class {
				constructor(){}

				getCustomerByEmail() {
					return Promise.resolve(null);
				}
				create() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

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

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				assureSession() {
					return Promise.resolve(session);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Account'), class {
				get() {
					return Promise.resolve()
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(){
					return Promise.resolve(true);
				}
				isAccountLimited(){
					return false;
				}
			});

			//PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.execute(event).then(result => {
				expect(global.SixCRM.validate(result, global.SixCRM.routes.path('model', 'endpoints/createLead/response.json'))).to.equal(true);
			});

		});

		it('successfully executes with local event', () => {

			let event = getLocalEvent();
			let customer = getValidCustomer();
			let affiliates = getValidAffiliates();
			let campaign = getValidCampaign();
			let session = getValidSession();
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

			let mock_customer = class {
				constructor(){}

				getCustomerByEmail() {
					return Promise.resolve(null);
				}
				create() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

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

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				assureSession() {
					return Promise.resolve(session);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Account'), class {
				get() {
					return Promise.resolve()
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(){
					return Promise.resolve(true);
				}
				isAccountLimited(){
					return false;
				}
			});
			//PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.execute(event).then(result => {
				expect(global.SixCRM.validate(result, global.SixCRM.routes.path('model', 'endpoints/createLead/response.json'))).to.equal(true);
			});

		});

	});

	describe('getCustomer', () => {

		it('successfully gets a new customer', () => {

			let event = getValidEventBody();
			let customer = getValidCustomer();

			let mock_customer = class {
				constructor(){}

				getCustomerByEmail() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.getCustomer(event).then(result => {
				expect(result).to.deep.equal(customer);
			});

		});

		it('successfully retrieves a existing customer', () => {

			let event = getValidEventBody();
			let customer = getValidCustomer();

			let mock_customer = class {
				constructor(){}

				getCustomerByEmail() {
					return Promise.resolve(null);
				}
				create() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.getCustomer(event).then(result => {
				expect(result).to.deep.equal(customer);
			});

		})
	});

	describe('getAffiliates', () => {

		it('successfully gets affiliates', () => {

			let event = getValidEventBody();
			let affiliates = getValidAffiliates();

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), class {
				constructor(){}
				handleAffiliateInformation(event){
					let cloned_event = objectutilities.clone(event);

					cloned_event.affiliates = affiliates;
					return Promise.resolve(cloned_event);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.getAffiliates(event).then(result => {
				expect(result).to.deep.equal(affiliates);
			});

		});

		it('does not update parameter affiliates if not needed', () => {

			let event = getValidEventBody();

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), class {
				constructor(){}
				handleAffiliateInformation(event){
					let cloned_event = objectutilities.clone(event);

					delete cloned_event.affiliates;
					return Promise.resolve(cloned_event);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.getAffiliates(event).then((result) => {
				expect(result).to.equal(undefined);
			});

		})
	});

	describe('getCampaign', () => {

		it('successfully gets the campaign', () => {

			let event = getValidEventBody();
			let campaign = getValidCampaign();

			event.campaign = campaign.id;

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.getCampaign(event).then(result => {
				expect(result).to.deep.equal(campaign);
			});

		});

	});

	describe('getLeadProperties', () => {

		it('successfully gets lead properties', () => {

			let event = getValidEventBody();
			let customer = getValidCustomer();
			let affiliates = getValidAffiliates();
			let campaign = getValidCampaign();

			let mock_customer = class {
				constructor(){}

				getCustomerByEmail() {
					return Promise.resolve(null);
				}
				create() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/affiliate/Affiliate.js'), class {
				constructor(){}
				handleAffiliateInformation(event){
					let cloned_event = objectutilities.clone(event);

					cloned_event.affiliates = affiliates;
					return Promise.resolve(cloned_event);
				}
			});

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.getLeadProperties(event).then(([customerResult, campaignResult, affiliatesResult]) => {
				expect(customerResult).to.deep.equal(customer);
				expect(campaignResult).to.deep.equal(campaign);
				expect(affiliatesResult).to.deep.equal(affiliates);
			});

		});
	});

	describe('createSessionPrototype', () => {

		it('successfully creates a session prototype', () => {

			let customer = getValidCustomer();
			let affiliates = getValidAffiliates();
			let campaign = getValidCampaign();
			let session_prototype =  objectutilities.merge({
				customer: customer.id,
				campaign: campaign.id,
				completed: false
			}, affiliates);

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			let result = createLeadController.createSessionPrototype(customer, campaign, affiliates);
			expect(result).to.deep.equal(session_prototype);
		});

		it('creates a session prototype even without affiliate parameter', () => {

			let customer = getValidCustomer();
			let campaign = getValidCampaign();
			let session_prototype = {
				customer: customer.id,
				campaign: campaign.id,
				completed: false
			};

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			let result = createLeadController.createSessionPrototype(customer, campaign, undefined);
			expect(result).to.deep.equal(session_prototype);
		});

	});

	describe('assureSession', () => {

		it('successfully assures the session', () => {

			let session_prototype = getValidSessionPrototype();
			let session = getValidSession();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				assureSession() {
					return Promise.resolve(session);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.assureSession(session_prototype).then(result => {
				expect(result).to.deep.equal(session);
			});

		});
	});

	describe('postProcessing', () => {

		it('successfully triggers all post processing', () => {

			let session = getValidSession();
			let campaign = getValidCampaign();
			let affiliates = getValidAffiliates();

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.postProcessing(session, campaign, affiliates);

		});

	});

	describe('createLead',  () => {

		it('successfully creates a lead', () => {

			let event = getValidEventBody();
			let customer = getValidCustomer();
			let affiliates = getValidAffiliates();
			let campaign = getValidCampaign();
			let session = getValidSession();

			let mock_customer = class {
				constructor(){}
				getCustomerByEmail() {
					return Promise.resolve(null);
				}
				create() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

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

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				assureSession() {
					return Promise.resolve(session);
				}
			});

			PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.createLead(event).then(result => {
				expect(global.SixCRM.validate(result, global.SixCRM.routes.path('model', 'endpoints/createLead/response.json'))).to.equal(true);
			});

		});

	});

	xdescribe('execute (LIVE)', () => {

		let global_user;

		beforeEach(() => {
			global_user = global.user;
		});

		afterEach(() => {
			global.user = global_user;
		});

		it('successfully executes', () => {

			mockery.resetCache();
			mockery.deregisterAll();

			let event = getValidEvent();
			let customer = getValidCustomer();
			let affiliates = getValidAffiliates();
			let campaign = getValidCampaign();
			let session = getValidSession();
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

			let mock_customer = class {
				constructor(){}

				getCustomerByEmail() {
					return Promise.resolve(null);
				}
				create() {
					return Promise.resolve(customer);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Customer.js'), mock_customer);

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

			let mock_campaign = class {
				constructor(){}

				get () {
					return Promise.resolve(campaign);
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Campaign.js'), mock_campaign);

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Session.js'), class {
				assureSession() {
					return Promise.resolve(session);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers','statemachine/StateMachine.js'), class{
				constructor(){}
				startExecution({parameters, restart}){
					expect(parameters).to.be.a('object');
					expect(restart).to.equal(false);
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
				constructor(){}
				sendMessage({message_body, queue, messageGroupId}){
					expect(message_body).to.be.a('string');
					expect(queue).to.be.a('string');
					expect(messageGroupId).to.be.a('string');
					return Promise.resolve(true);
				}
			});

			//PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			const CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.execute(event).then(result => {
				expect(global.SixCRM.validate(result, global.SixCRM.routes.path('model', 'endpoints/createLead/response.json'))).to.equal(true);
			});

		});

	});

});
