const _ = require('lodash')
const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const eu = global.SixCRM.routes.include('lib','error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');
const random = global.SixCRM.routes.include('lib','random.js');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');
const PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators.js');

describe('/helpers/invite/Invite.js', () => {

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

			const InviteHelperClass = global.SixCRM.routes.include('helpers','invite/Invite.js');
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

			const InviteHelperClass = global.SixCRM.routes.include('helpers','invite/Invite.js');
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

			const InviteHelperClass = global.SixCRM.routes.include('helpers','invite/Invite.js');
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

			const InviteHelperClass = global.SixCRM.routes.include('helpers','invite/Invite.js');
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

			const InviteHelperClass = global.SixCRM.routes.include('helpers','invite/Invite.js');
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

	describe('acceptInvite', () => {

		it('successfully accepts a invite', () => {

			let now = timestamp.getISO8601();
			let account = MockEntities.getValidAccount();
			let role = MockEntities.getValidRole();
			let user = MockEntities.getValidUser();
			let acl = MockEntities.getValidUserACL();
			acl.pending = 'Invite Sent';
			acl.user = user.id;
			acl.account = account.id;
			acl.role = role.id;

			let invite = MockEntities.getValidInvite();
			invite.email = user.id;
			invite.acl = acl.id;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Invite.js'), class {
				constructor(){}
				getByHash(hash){
					expect(hash).to.be.defined;
					return Promise.resolve(invite);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/User.js'), class {
				constructor(){}
				assureUser(user_id){
					expect(user_id).to.equal(acl.user);
					return Promise.resolve(user);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				constructor(){}
				get({id}) {
					expect(id).to.equal(acl.id);
					return Promise.resolve(acl);
				}
				update({entity: entity}){
					expect(entity.id).to.equal(acl.id);
					delete entity.pending;
					return Promise.resolve(entity);
				}
			});

			const InviteHelperClass = global.SixCRM.routes.include('helpers','invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			return inviteHelperClass.acceptInvite({hash: invite.hash}).then((result) => {
				expect(result).to.equal(user);
			});

		});

		it('fails (no matching hash)', () => {

			let now = timestamp.getISO8601();
			let account = MockEntities.getValidAccount();
			let role = MockEntities.getValidRole();
			let user = MockEntities.getValidUser();
			let acl = MockEntities.getValidUserACL();
			acl.pending = 'Invite Sent';
			acl.user = user.id;
			acl.account = account.id;
			acl.role = role.id;

			let invite = MockEntities.getValidInvite();
			invite.email = user.id;
			invite.acl = acl.id;

			mockery.registerMock(global.SixCRM.routes.path('entities', 'Invite.js'), class {
				constructor(){}
				getByHash(hash){
					expect(hash).to.be.defined;
					throw eu.getError('not_found', 'Invite not found.');
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/User.js'), class {
				constructor(){}
				assureUser(user_id){
					expect(user_id).to.equal(acl.user);
					return Promise.resolve(user);
				}
			});

			mockery.registerMock(global.SixCRM.routes.path('controllers','entities/UserACL.js'), class {
				constructor(){}
				get({id}) {
					expect(id).to.equal(acl.id);
					return Promise.resolve(acl);
				}
				update({entity: entity}){
					expect(entity.id).to.equal(acl.id);
					delete entity.pending;
					return Promise.resolve(entity);
				}
			});

			const InviteHelperClass = global.SixCRM.routes.include('helpers','invite/Invite.js');
			let inviteHelperClass = new InviteHelperClass();

			return inviteHelperClass.acceptInvite({hash: invite.hash}).catch(error => {
				expect(error.message).to.equal('[404] Invite not found.');
			});

		});

	});

});
