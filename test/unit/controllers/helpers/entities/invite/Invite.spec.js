const _ = require('lodash')
const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const eu = global.SixCRM.routes.include('lib','error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');
const random = global.SixCRM.routes.include('lib','random.js');
const signatureutilities = global.SixCRM.routes.include('lib','signature.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

describe('/helpers/entities/invite/Invite.js', () => {

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

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sns-provider.js'), class {
			publish() {
				return Promise.resolve({});
			}
			getRegion() {
				return 'localhost';
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
	});

	describe('constructor', () => {

		it('successfully constructs', () => {

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			expect(objectutilities.getClassName(inviteHelperClass)).to.equal('InviteHelperClass');

		});

	});

	describe('invite', () => {

		it('successfully invites user to account', () => {

			PermissionTestGenerators.givenUserWithAllowed('*','*');

			let user =  MockEntities.getValidUser();
			let role = MockEntities.getValidRole();
			let account = MockEntities.getValidAccount();
			let acl = MockEntities.getValidUserACL();
			acl.account = account.id;
  		acl.user = user.id;
  		acl.role = role.id;

			let now = timestamp.getISO8601();

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Account.js'), class {
				constructor(){}
				get({id}){
					expect(id).to.equal(account.id);
					return Promise.resolve(account)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Invite.js'), class {
				constructor(){}
				create({entity}){
					expect(entity).to.be.defined;
					if(!_.has(entity, 'hash')){
						entity.hash = random.createRandomString(8);
					}
					entity.created_at = now;
					entity.updated_at = now;
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Role.js'), class {
				constructor(){}
				get({id}){
					expect(id).to.equal(role.id);
					return Promise.resolve(role)
				}
				getShared({id}){
					expect(id).to.equal(role.id);
					return Promise.resolve(role)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/User.js'), class {
				constructor(){}
				assureUser(id) {
					expect(id).to.equal(user.id);
					return Promise.resolve(user);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				create({entity}) {
					expect(entity.user).to.equal(user.id);
					expect(entity.account).to.equal(account.id);
					expect(entity.role).to.equal(role.id);
					expect(entity.pending).to.equal('Invite Sent');
					return Promise.resolve(acl);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), class {
				constructor(){}
				sendEmail(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				pushEvent({event_type}) {
					expect(event_type).to.be.defined;
					return Promise.resolve(true);
				}
			});

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			let user_invite = {
				email: user.id,
				account: account.id,
				role: role.id
			};

			return inviteHelperClass.invite({user_invite: user_invite}).then((result) => {
				expect(result).to.have.property('link');
				expect(result.link).to.have.string('https://');
				expect(result.link).to.have.string('acceptinvite');
			});

		});

		it('throws error when role retrieving failed', () => {

			PermissionTestGenerators.givenUserWithAllowed('*','*');

			let user =  MockEntities.getValidUser();
			let role = MockEntities.getValidRole();
			let account = MockEntities.getValidAccount();
			let acl = MockEntities.getValidUserACL();
			acl.account = account.id;
  		acl.user = user.id;
  		acl.role = role.id;

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Account.js'), class {
				constructor(){}
				get({id}){
					expect(id).to.equal(account.id);
					return Promise.resolve(account)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Role.js'), class {
				constructor(){}
				get({id}){
					expect(id).to.equal(role.id);
					return Promise.resolve(null)
				}
				getShared({id}){
					expect(id).to.equal(role.id);
					return Promise.resolve(role)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/User.js'), class {
				constructor(){}
				assureUser(id) {
					expect(id).to.equal(user.id);
					return Promise.resolve(null);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				create({entity}) {
					expect(entity.user).to.equal(user.id);
					expect(entity.account).to.equal(account.id);
					expect(entity.role).to.equal(role.id);
					expect(entity.pending).to.equal('Invite Sent');
					return Promise.resolve(acl);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), class {
				constructor(){}
				sendEmail(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				pushEvent({event_type}) {
					expect(event_type).to.be.defined;
					return Promise.resolve(true);
				}
			});

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			let user_invite = {
				email: user.id,
				account: account.id,
				role: role.id
			};

			return inviteHelperClass.invite({user_invite: user_invite}).then(() => {
				expect(true).to.equal(false);
			}).catch((error) => {
				expect(error.message).to.have.string('[500] One or more validation errors occurred:');
			});

		});

		it('throws error when account retrieving failed', () => {

			PermissionTestGenerators.givenUserWithAllowed('*','*');

			let user =  MockEntities.getValidUser();
			let role = MockEntities.getValidRole();
			let account = MockEntities.getValidAccount();
			let acl = MockEntities.getValidUserACL();
			acl.account = account.id;
  		acl.user = user.id;
  		acl.role = role.id;

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Account.js'), class {
				constructor(){}
				get({id}){
					expect(id).to.equal(account.id);
					return Promise.resolve(null)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Role.js'), class {
				constructor(){}
				get({id}){
					expect(id).to.equal(role.id);
					return Promise.resolve(role)
				}
				getShared({id}){
					expect(id).to.equal(role.id);
					return Promise.resolve(role)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/User.js'), class {
				constructor(){}
				assureUser(id) {
					expect(id).to.equal(user.id);
					return Promise.resolve(null);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				create({entity}) {
					expect(entity.user).to.equal(user.id);
					expect(entity.account).to.equal(account.id);
					expect(entity.role).to.equal(role.id);
					expect(entity.pending).to.equal('Invite Sent');
					return Promise.resolve(acl);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), class {
				constructor(){}
				sendEmail(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				pushEvent({event_type}) {
					expect(event_type).to.be.defined;
					return Promise.resolve(true);
				}
			});

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			let user_invite = {
				email: user.id,
				account: account.id,
				role: role.id
			};

			return inviteHelperClass.invite({user_invite: user_invite}).then(() => {
				expect(true).to.equal(false);
			}).catch((error) => {
				expect(error.message).to.have.string('[500] One or more validation errors occurred:');
			});

		});

	});

	describe('inviteResend', () => {

		it('successfully resends an invite', () => {

			let user =  MockEntities.getValidUser();
			let role = MockEntities.getValidRole();
			let account = MockEntities.getValidAccount();
			let acl = MockEntities.getValidUserACL();
			acl.pending = 'Invite Sent';
			acl.account = account.id;
			acl.user = user.id;
			acl.role = role.id;

			PermissionTestGenerators.givenUserWithAllowed('read', 'user');

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Account.js'), class {
				constructor(){}
				get({id}){
					expect(id).to.equal(account.id);
					return Promise.resolve(account)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/Role.js'), class {
				constructor(){}
				get({id}){
					expect(id).to.equal(role.id);
					return Promise.resolve(role)
				}
				getShared({id}){
					expect(id).to.equal(role.id);
					return Promise.resolve(role)
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/User.js'), class {
				constructor(){}
				get({id}) {
					expect(id).to.equal(user.id);
					return Promise.resolve(user);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				constructor(){}
				get({id}) {
					expect(id).to.equal(acl.id);
					return Promise.resolve(acl);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), class {
				constructor(){}
				sendEmail(){
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'events/Event.js'), class {
				pushEvent({event_type}) {
					expect(event_type).to.be.defined;
					return Promise.resolve(true);
				}
			});

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			let user_invite = {
				acl:acl.id
			};

			return inviteHelperClass.inviteResend({user_invite: user_invite}).then((result) => {
				expect(result).to.have.property('link');
				expect(result.link).to.have.string('https://');
				expect(result.link).to.have.string('acceptinvite');
			});

		});

	});

	describe('accept', () => {

		it('successfully accepts a invite (existing user)', () => {

			let invite = MockEntities.getValidInvite();
			let useracl = MockEntities.getValidUserACL();
			let user = MockEntities.getValidUser();

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Invite.js'), class {
				constructor(){}
				disableACLs(){
					return true;
				}
				enableACLs(){
					return true;
				}
				getByHash(hash){
					expect(hash).to.be.a('string');
					return Promise.resolve(invite);
				}
				delete({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserACL.js'), class {
				constructor(){}
				disableACLs(){
					return true;
				}
				enableACLs(){
					return true;
				}
				get({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(useracl);
				}
				update({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), class {
				constructor(){}
				disableACLs(){
					return true;
				}
				enableACLs(){
					return true;
				}
				get({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(user);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(account){
					expect(account).to.be.a('string');
					return Promise.resolve(true);
				}
			});

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			const signature = signatureutilities.createSignature(invite.hash+invite.created_at, inviteHelperClass.invite_salt);

			const argumentation = {
				hash: invite.hash,
				signature:signature
			};

			return inviteHelperClass.accept(argumentation).then(result => {
				expect(result).to.have.property('account');
				expect(result).to.have.property('is_new');
				expect(result.account).to.equal(invite.account);
				expect(result.is_new).to.equal(!_.has(user, 'auth0_id'));
			});
		});

		it('successfully accepts a invite (new user)', () => {

			let invite = MockEntities.getValidInvite();
			let useracl = MockEntities.getValidUserACL();
			let user = MockEntities.getValidUser();
			delete user.auth0_id;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Invite.js'), class {
				constructor(){}
				disableACLs(){
					return true;
				}
				enableACLs(){
					return true;
				}
				getByHash(hash){
					expect(hash).to.be.a('string');
					return Promise.resolve(invite);
				}
				delete({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(true);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'UserACL.js'), class {
				constructor(){}
				disableACLs(){
					return true;
				}
				enableACLs(){
					return true;
				}
				get({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(useracl);
				}
				update({entity}){
					expect(entity).to.be.a('object');
					return Promise.resolve(entity);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('entities', 'User.js'), class {
				constructor(){}
				disableACLs(){
					return true;
				}
				enableACLs(){
					return true;
				}
				get({id}){
					expect(id).to.be.a('string');
					return Promise.resolve(user);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'entities/account/Account.js'), class {
				constructor(){}
				validateAccount(account){
					expect(account).to.be.a('string');
					return Promise.resolve(true);
				}
			});

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			const signature = signatureutilities.createSignature(invite.hash+invite.created_at, inviteHelperClass.invite_salt);

			const argumentation = {
				hash: invite.hash,
				signature:signature
			};

			return inviteHelperClass.accept(argumentation).then(result => {
				expect(result).to.have.property('account');
				expect(result).to.have.property('is_new');
				expect(result.account).to.equal(invite.account);
				expect(result.is_new).to.equal(!_.has(user, 'auth0_id'));
			});
		});

	});

	describe('_sendEmailToInvitedUser', async () => {

		it('correctly parses', async () => {

			let invite = MockEntities.getValidInvite();
			let link = 'https://blerf.com'

			mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), class {

				constructor(){}

				sendEmail(email){
					
					expect(email).to.be.a('object');
					expect(email).to.have.property('recepient_emails');
					expect(email).to.have.property('recepient_name');
					expect(email).to.have.property('subject');
					expect(email).to.have.property('body');
					expect(email.recepient_emails).to.be.a('array');
					expect(email.recepient_emails[0]).to.equal(invite.email);
					expect(email.recepient_name).to.be.a('string');
					expect(email.recepient_name).to.have.string('Welcome to ');
					expect(email.recepient_name).not.to.have.string('{{');
					expect(email.recepient_name).not.to.have.string('}}');
					expect(email.subject).to.be.a('string');
					expect(email.subject).not.to.have.string('}}');
					expect(email.subject).not.to.have.string('{{');
					expect(email.subject).to.have.string('You\'ve been invited to join a account on ');
					expect(email.body).to.be.a('string');
					expect(email.body).not.to.have.string('}}');
					expect(email.body).not.to.have.string('{{');
					expect(email.body).to.have.string('Please accept this invite using the link below: https://blerf.com');

					return Promise.resolve(true);
				}

			});

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			let result = await inviteHelperClass._sendEmailToInvitedUser(invite, link);
			expect(result).to.equal(true);

		});

	});

	describe('_getAPIDomain', () => {

		let configuration;

		beforeEach(() => {

			configuration = global.SixCRM.configuration;

		});

		afterEach(() => {

			global.SixCRM.configuration = configuration;

		});

		it('correctly establishes the domain', () => {

			global.SixCRM.configuration.site_config.site.domain = 'blergoff.jerp';
			global.SixCRM.configuration.stage = 'parmesean';

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			let domain = inviteHelperClass._getAPIDomain('admin');
			expect(domain).to.equal('parmesean-admin.blergoff.jerp');

		});

		it('correctly establishes the domain', () => {

			global.SixCRM.configuration.site_config.site.domain = 'blergoff.jerp';
			global.SixCRM.configuration.stage = 'production';

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			let domain = inviteHelperClass._getAPIDomain('admin');
			expect(domain).to.equal('admin.blergoff.jerp');

		});

		it('correctly establishes the domain', () => {

			global.SixCRM.configuration.site_config.site.domain = 'blergoff.jerp';
			global.SixCRM.configuration.stage = 'production';

			const InviteHelperClass = global.SixCRM.routes.include('helpers','entities/invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			let domain = inviteHelperClass._getAPIDomain();
			expect(domain).to.equal('blergoff.jerp');

		});

	});

	describe('acknowledge', () => {

	});

});
