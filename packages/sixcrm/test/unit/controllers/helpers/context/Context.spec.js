
const chai = require('chai');
const expect = chai.expect;
const objectutilities = require('@6crm/sixcrmcore/lib/util/object-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const timestamp = require('@6crm/sixcrmcore/lib/util/timestamp').default;

function getExampleContext(){

	return {
		event: {
			account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
			customer: {
				email: 'Pierce.Connelly@kathryne.org',
				firstname: 'Pierce',
				lastname: 'Connelly',
				phone: '(144) 257-9625 x499',
				address: {
					line1: '4899 Flatley Forks',
					city: 'North Jenaberg',
					state: 'ND',
					zip: '80609-7441',
					country: 'GG',
					line2: 'Apt. 652'
				},
				billing: {
					line1: '4899 Flatley Forks',
					city: 'North Jenaberg',
					state: 'ND',
					zip: '80609-7441',
					country: 'GG',
					line2: 'Apt. 652'
				},
				id: 'e17d5346-0fd0-44c1-9c9d-028b40ab568b',
				account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
				created_at: '2018-03-18T21:22:40.036Z',
				updated_at: '2018-03-18T21:22:40.036Z',
				entity_type: 'customer',
				index_action: 'add'
			},
			affiliates: {
				affiliate: 'cdeaaa9d-27be-4d8e-8ce7-2cfc20595042',
				subaffiliate2: 'V6SD4YQ6QF4UTACCEY5B',
				subaffiliate3: 'UZA6HYA52EBCPQY7PDS9',
				cid: '3c3662b9-0520-4db7-bb62-bacafbb405ef'
			}
		},
		campaign: {
			updated_at: '2018-03-18T20:23:20.698Z',
			productschedules: [
				'12529a17-ac32-4e46-b05b-83862843055d',
				'8d1e896f-c50d-4a6b-8c84-d5661c16a046'
			],
			created_at: '2018-01-18T14:52:47.220Z',
			emailtemplates: [
				'b44ce483-861c-4843-a7d6-b4c649d6bdde',
				'8108d6a3-2d10-4013-9e8e-df71e2dc578b',
				'102131a0-4cc4-4463-a614-e3157c3f03c2'
			],
			allow_prepaid: false,
			affiliate_allow: [ 'ad58ea78-504f-4a7e-ad45-128b6e76dc57' ],
			account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			show_prepaid: false,
			affiliate_deny: [ '*' ],
			id: '70a6689a-5814-438b-b9fd-dd484d0812f9',
			name: 'Example Campaign'
		},
		customer:{
			email: 'Pierce.Connelly@kathryne.org',
			firstname: 'Pierce',
			lastname: 'Connelly',
			phone: '(144) 257-9625 x499',
			address:{
				line1: '4899 Flatley Forks',
				city: 'North Jenaberg',
				state: 'ND',
				zip: '80609-7441',
				country: 'GG',
				line2: 'Apt. 652'
			},
			billing:{
				line1: '4899 Flatley Forks',
				city: 'North Jenaberg',
				state: 'ND',
				zip: '80609-7441',
				country: 'GG',
				line2: 'Apt. 652'
			},
			id: 'e17d5346-0fd0-44c1-9c9d-028b40ab568b',
			account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			created_at: '2018-03-18T21:22:40.036Z',
			updated_at: '2018-03-18T21:22:40.036Z',
			entity_type: 'customer',
			index_action: 'add'
		},
		affiliates: {
			affiliate: 'cdeaaa9d-27be-4d8e-8ce7-2cfc20595042',
			subaffiliate2: 'V6SD4YQ6QF4UTACCEY5B',
			subaffiliate3: 'UZA6HYA52EBCPQY7PDS9',
			cid: '3c3662b9-0520-4db7-bb62-bacafbb405ef'
		},
		session_prototype: {
			customer: 'e17d5346-0fd0-44c1-9c9d-028b40ab568b',
			campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
			completed: false,
			affiliate: 'cdeaaa9d-27be-4d8e-8ce7-2cfc20595042',
			subaffiliate2: 'V6SD4YQ6QF4UTACCEY5B',
			subaffiliate3: 'UZA6HYA52EBCPQY7PDS9',
			cid: '3c3662b9-0520-4db7-bb62-bacafbb405ef'
		},
		session: {
			completed: false,
			customer: 'e17d5346-0fd0-44c1-9c9d-028b40ab568b',
			campaign: '70a6689a-5814-438b-b9fd-dd484d0812f9',
			affiliate: 'cdeaaa9d-27be-4d8e-8ce7-2cfc20595042',
			cid: '3c3662b9-0520-4db7-bb62-bacafbb405ef',
			alias: 'S281P5BKSZ',
			id: 'db63ba2d-8a0c-4df5-8332-ab500de93fcc',
			account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
			created_at: '2018-03-18T21:22:40.264Z',
			updated_at: '2018-03-18T21:22:40.264Z',
			entity_type: 'session',
			index_action: 'add'
		}
	};

}
describe('helpers/context/Context.js', () => {
	describe('constructor', () => {
		it('successfully constructs', () => {
			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();
			expect(objectutilities.getClassName(contextHelperController)).to.equal('ContextHelperController');
		});
	});

	describe('getFromContext', () => {
		it('successfully retrieves objects from context', () => {
			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let desired_user = 'some@user.com';

			let contexts = [
				{
					user:{ id: desired_user }
				},
				{
					user: { id: desired_user },
					account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
				},
				{
					event: {
						user: { id: desired_user },
					},
					account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c'
				}
			];

			arrayutilities.map(contexts, context => {
				let user = contextHelperController.getFromContext(context, 'user.id', 'id');
				expect(user).to.equal(desired_user);
			});

		});

		it('successfully retrieves objects from context', () => {
			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let desired_user = 'some@user.com';

			let contexts = [
				{
					user: desired_user
				},
				{
					event: {
						user: desired_user
					}
				}
			];

			arrayutilities.map(contexts, context => {
				let user = contextHelperController.getFromContext(context, 'user', 'id');
				expect(user).to.equal(desired_user);
			});

		});

		it('successfully identifies the account from context', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let discovered_account = contextHelperController.getFromContext(context, 'account', 'id');
			expect(discovered_account).to.equal('d3fa3bf3-7824-49f4-8261-87674482bf1c');

		});

		it('successfully identifies the account from context without false positives', () => {

			let context = {
				event: {
					context: {
						account: 'd3fa3bf3-7824-49f4-8261-87674482bf1c',
						user: {
							acl: {
								account: {
									id: '*'
								}
							}
						}
					}
				}
			};

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let discovered_account = contextHelperController.getFromContext(context, 'account', 'id');
			expect(discovered_account).to.equal('d3fa3bf3-7824-49f4-8261-87674482bf1c');

		});

		it('successfully identifies the campaign.name from context', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let discovered_account = contextHelperController.getFromContext(context, 'campaign.name', false);
			expect(discovered_account).to.equal('Example Campaign');

		});

		it('successfully identifies an email from context', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let discovered_email = contextHelperController.getFromContext(context, 'customer.email', 'email');
			expect(discovered_email).to.equal(context.event.customer.email);

		});

		it('returns null when identified value is not an email type', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let discovered_firstname = contextHelperController.getFromContext(context, 'customer.firstname', 'email');
			expect(discovered_firstname).to.equal(null);

		});

		it('returns null when identified value is not an id type', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let discovered_firstname = contextHelperController.getFromContext(context, 'customer.firstname', 'id');
			expect(discovered_firstname).to.equal(null);

		});

		it('returns null when identified value is not an id type', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let discovered_allow_prepaid = contextHelperController.getFromContext(context, 'campaign.allow_prepaid', 'id');
			expect(discovered_allow_prepaid).to.equal(null);

		});

		it('successfully identifies an address from context', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let discovered_address = contextHelperController.getFromContext(context, 'customer.address', 'object');
			expect(discovered_address).to.deep.equal(context.customer.address);

		});

		it('returns null when identified value is not an object', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let discovered_address = contextHelperController.getFromContext(context, 'customer.firstname', 'object');
			expect(discovered_address).to.deep.equal(null);

		});

		it('successfully identifies the account from context when type is omitted', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let discovered_account = contextHelperController.getFromContext(context, 'account');
			expect(discovered_account).to.equal(context.event.account);

		});
	});

	describe('discoverObjectsFromContext', () => {

		it('successfully discovers account data from context', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.discoverObjectsFromContext(['account'], context)).to.deep.equal({
				account: "d3fa3bf3-7824-49f4-8261-87674482bf1c"
			});

		});

		it('returns no data when search objects do not exist', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.discoverObjectsFromContext(['non-existing_search_object'], context)).to.deep.equal({});

		});

		it('throws error when specified search objects are not an array', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			try {
				contextHelperController.discoverObjectsFromContext('account', context)
			} catch (error) {
				expect(error.message).to.equal('[500] ArrayUtilities.map array argument is not a array.');
			}

		});

		it('throws error when fatal is true and search objects do not exist', () => {

			let context = getExampleContext();

			let non_existing_search_object = 'non-existing_search_object';

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			try {
				contextHelperController.discoverObjectsFromContext([non_existing_search_object], context, true)
			} catch (error) {
				expect(error.message).to.equal('[500] Unable to discover ' + non_existing_search_object + ' in context.');
			}
		});
	});

	describe('transcribeAccount', () => {

		it('successfully transcribes account data from campaign in context', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeAccount(context, {})).to.deep.equal({
				account: "d3fa3bf3-7824-49f4-8261-87674482bf1c"
			});

		});

		it('successfully transcribes account data from session in context', () => {

			let context = getExampleContext();

			delete context.campaign;

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeAccount(context, {})).to.deep.equal({
				account: "d3fa3bf3-7824-49f4-8261-87674482bf1c"
			});

		});

		it('successfully transcribes account from source', () => {

			let context = getExampleContext();

			let source = context.event; //object that contains 'account'

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeAccount(source, {})).to.deep.equal({
				account: "d3fa3bf3-7824-49f4-8261-87674482bf1c"
			});

		});

		it('returns unchanged destination object when it already contains "account"', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeAccount({}, context.campaign)).to.deep.equal(context.campaign);

		});

		it('throws error when source and destination do not contain "account"', () => {

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			try {
				contextHelperController.transcribeAccount({}, {})
			} catch (error) {
				expect(error.message).to.equal("[500] Unable to identify account.");
			}
		});
	});

	describe('transcribeCampaignFields', () => {

		it('successfully transcribes campaign data from context', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeCampaignFields(context, {})).to.deep.equal({
				campaign: "70a6689a-5814-438b-b9fd-dd484d0812f9"
			});

		});

		it('successfully transcribes campaign data from nested object in context', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeCampaignFields(context.event, {})).to.deep.equal({
				campaign: "70a6689a-5814-438b-b9fd-dd484d0812f9"
			});

		});

		it('returns unchanged destination object when it already contains campaign data', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeCampaignFields({}, context.session)).to.deep.equal(context.session);

		});

		it('throws error when source and destination do not contain "campaign"', () => {

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			try {
				contextHelperController.transcribeCampaignFields({}, {})
			} catch (error) {
				expect(error.message).to.equal("[500] Unable to determine campaign field.");
			}
		});
	});

	describe('transcribeDatetime', () => {

		it('successfully transcribes datetime from session\'s "updated_at" property', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeDatetime(context, {})).to.deep.equal({
				datetime: "2018-03-18T21:22:40.264Z"
			});

		});

		it('successfully transcribes datetime from source', () => {

			let a_source = {
				datetime: "2018-03-18T21:22:40.264Z"
			};

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeDatetime(a_source, {})).to.deep.equal({
				datetime: "2018-03-18T21:22:40.264Z"
			});

		});

		it('successfully transcribes datetime from source', () => {

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			let destination = contextHelperController.transcribeDatetime({}, {});

			expect(timestamp.getSecondsDifference(destination.datetime)).to.be.below(5);
		});
	});

	describe('transcribeSessionFields', () => {

		it('successfully transcribes session from context', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeSessionFields(context, {})).to.deep.equal({
				session: "db63ba2d-8a0c-4df5-8332-ab500de93fcc"
			});

		});

		it('successfully transcribes session from source', () => {

			let a_source = {
				session: "db63ba2d-8a0c-4df5-8332-ab500de93fcc"
			};

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeSessionFields(a_source, {})).to.deep.equal({
				session: "db63ba2d-8a0c-4df5-8332-ab500de93fcc"
			});

		});

		it('returns destination object with empty session data', () => {

			let context = getExampleContext();

			delete context.session.id;

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeSessionFields(context, {})).to.deep.equal({
				session: ""
			});

		});

		it('returns destination object with empty session data when source does not have session data', () => {

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeSessionFields({}, {})).to.deep.equal({
				session: ""
			});

		});
	});

	describe('discoverIDs', () => {

		it('successfully discovers ids', () => {

			let context = getExampleContext();

			let params = [
				context.customer, context.session, context.campaign
			];

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.discoverIDs(params, 'account')).to.deep.equal([
				"e17d5346-0fd0-44c1-9c9d-028b40ab568b",
				"db63ba2d-8a0c-4df5-8332-ab500de93fcc",
				"70a6689a-5814-438b-b9fd-dd484d0812f9"
			]
			);

		});

		it('successfully discovers ids when either an "id" or specified search parameter exist in an array', () => {

			let context = getExampleContext();

			let params = [
				context.customer, context.session, context.affiliates
			];

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.discoverIDs(params, 'cid')).to.deep.equal([
				"e17d5346-0fd0-44c1-9c9d-028b40ab568b",
				"db63ba2d-8a0c-4df5-8332-ab500de93fcc",
				"3c3662b9-0520-4db7-bb62-bacafbb405ef"
			]);

		});

		it('successfully discovers id based on specified search parameter', () => {

			let context = getExampleContext();

			let params = [
				context.affiliates
			];

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.discoverIDs(params, 'cid')).to.deep.equal([
				"3c3662b9-0520-4db7-bb62-bacafbb405ef"
			]);

		});

		it('successfully discovers id in nested object', () => {

			let context = getExampleContext();

			let params = [
				context.event
			];

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.discoverIDs(params, 'customer')).to.deep.equal([
				"e17d5346-0fd0-44c1-9c9d-028b40ab568b"
			]);

		});

		it('returns unchanged array when it already contains ids', () => {

			let context = getExampleContext();

			let params = [
				context.customer.id, context.session.id
			];

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.discoverIDs(params)).to.deep.equal([
				"e17d5346-0fd0-44c1-9c9d-028b40ab568b",
				"db63ba2d-8a0c-4df5-8332-ab500de93fcc"
			]);

		});

		it('returns an empty array when id is not found', () => {

			let context = getExampleContext();

			delete context.customer.id;

			let params = [
				context.customer
			];

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.discoverIDs(params)).to.deep.equal([]);

		});

		it('throws error when params are not an array', () => {

			let context = getExampleContext();

			let params = context.customer.id;

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			try {
				contextHelperController.discoverIDs(params)
			}catch (error){
				expect(error.message).to.equal("[500] ArrayUtilities.filter array argument is not a array.");
			}

		});
	});

	describe('transcribeAffiliates', () => {

		it('successfully transcribes affiliates from context', () => {

			let context = getExampleContext();

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeAffiliates(context, {})).to.deep.equal({
				affiliate: "cdeaaa9d-27be-4d8e-8ce7-2cfc20595042",
				cid: "3c3662b9-0520-4db7-bb62-bacafbb405ef"
			});

		});

		it('successfully transcribes affiliates from session', () => {

			let context = getExampleContext();

			delete context.affiliates;

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeAffiliates(context, {})).to.deep.equal({
				affiliate: "cdeaaa9d-27be-4d8e-8ce7-2cfc20595042",
				cid: "3c3662b9-0520-4db7-bb62-bacafbb405ef"
			});

		});

		it('returns empty object when affiliates are not found in source object', () => {

			let context = getExampleContext();

			delete context.affiliates;
			delete context.session;

			const ContextHelperController = global.SixCRM.routes.include('helpers','context/Context.js');
			let contextHelperController = new ContextHelperController();

			expect(contextHelperController.transcribeAffiliates(context, {})).to.deep.equal({});

		});
	});
});
