

const mockery = require('mockery');
let chai = require('chai');
const uuidV4 = require('uuid/v4');

const expect = chai.expect;
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const randomutilities = global.SixCRM.routes.include('lib', 'random.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

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
			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
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

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(){
					return Promise.resolve(true);
				}
			});

			//PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.execute(event).then(result => {
				expect(mvu.validateModel(result, global.SixCRM.routes.path('model', 'entities/session.json'))).to.equal(true);
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

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(){
					return Promise.resolve(true);
				}
			});
			//PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			return createLeadController.execute(event).then(result => {
				expect(mvu.validateModel(result, global.SixCRM.routes.path('model', 'entities/session.json'))).to.equal(true);
			});

		});

	});

	describe('assureCustomer', () => {

		it('successfully sets a new customer', () => {

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

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('event', event);
			return createLeadController.assureCustomer().then(result => {
				expect(result).to.equal(true);
				expect(createLeadController.parameters.store['customer']).to.deep.equal(customer);
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

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('event', event);
			return createLeadController.assureCustomer().then(result => {
				expect(result).to.equal(true);
				expect(createLeadController.parameters.store['customer']).to.deep.equal(customer);
			});

		})
	});

	describe('assureAffiliates', () => {

		it('successfully assures affiliates', () => {

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

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('event', event);
			return createLeadController.assureAffiliates().then(result => {
				expect(result).to.equal(true);
				expect(createLeadController.parameters.store['affiliates']).to.deep.equal(affiliates);
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

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('event', event);
			return createLeadController.assureAffiliates().then(() => {
				expect(createLeadController.parameters.affiliates).to.equal(undefined);
			});

		})
	});

	describe('setCampaign', () => {

		it('successfully sets the campaign', () => {

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

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('event', event);
			return createLeadController.setCampaign().then(result => {
				expect(result).to.equal(true);
				expect(createLeadController.parameters.store['campaign']).to.deep.equal(campaign);
			});

		});

	});

	describe('assureLeadProperties', () => {

		it('successfully assures lead properties', () => {

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

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('event', event);

			return createLeadController.assureLeadProperties().then(result => {
				expect(result).to.equal(true);
				expect(createLeadController.parameters.store['campaign']).to.deep.equal(campaign);
				expect(createLeadController.parameters.store['affiliates']).to.deep.equal(affiliates);
				expect(createLeadController.parameters.store['customer']).to.deep.equal(customer);
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

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('customer', customer);
			createLeadController.parameters.set('campaign', campaign);
			createLeadController.parameters.set('affiliates', affiliates);

			return createLeadController.createSessionPrototype().then(result => {
				expect(result).to.equal(true);
				expect(createLeadController.parameters.store['session_prototype']).to.deep.equal(session_prototype);

			});
		});

		it('creates a session prototype even without affiliate parameter', () => {

			let customer = getValidCustomer();
			let campaign = getValidCampaign();
			let session_prototype = {
				customer: customer.id,
				campaign: campaign.id,
				completed: false
			};

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('customer', customer);
			createLeadController.parameters.set('campaign', campaign);

			return createLeadController.createSessionPrototype().then(result => {
				expect(result).to.equal(true);
				expect(createLeadController.parameters.store['session_prototype']).to.deep.equal(session_prototype);
			});
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

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('session_prototype', session_prototype);
			return createLeadController.assureSession().then(result => {
				expect(result).to.equal(true);
				expect(createLeadController.parameters.store['session']).to.deep.equal(session);
			});

		});
	});

	describe('postProcessing', () => {

		it('successfully triggers all post processing', () => {

			let session = getValidSession();
			let event = getValidEventBody();

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('session', session);
			createLeadController.parameters.set('event', event);

			return createLeadController.postProcessing();

		});

	});

	describe('createLead',  () => {

		it.only('successfully creates a lead', () => {

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

			let CreateLeadController = global.SixCRM.routes.include('controllers', 'endpoints/createLead.js');
			const createLeadController = new CreateLeadController();

			createLeadController.parameters.set('event', event);

			return createLeadController.createLead().then(result => {
				expect(mvu.validateModel(result, global.SixCRM.routes.path('model', 'endpoints/createLead/response.json'))).to.equal(true);
			});

		});

	});

});
