const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;
const objectutilities = global.SixCRM.routes.include('lib','object-utilities.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');
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
        get({id}) {
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
        get({id}) {
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

      let invite_object = {
        email: user.id,
        acl: acl.id,
        invitor: 'some@email.com',
        account: account.id,
        role: role.id,
        timestamp: now
      };

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

      let parameters = inviteHelperClass._encodeParameters(inviteHelperClass._buildPreEncryptedString(invite_object, now));
      let token = inviteHelperClass._buildInviteToken(inviteHelperClass._buildPreEncryptedString(invite_object, now));

      let invite = {
        token: token,
        parameters: parameters
      };

      return inviteHelperClass.acceptInvite({invite: invite}).then((result) => {
        expect(result).to.equal(user);
      });

    });

  });

});
