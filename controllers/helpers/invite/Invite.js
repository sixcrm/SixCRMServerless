const _ = require('underscore');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const InviteUtilities = global.SixCRM.routes.include('helpers', 'invite/InviteUtilities.js');

module.exports = class InviteHelperClass extends InviteUtilities {

  constructor(){

    super();

    this.parameter_validation = {
      account: global.SixCRM.routes.path('model','entities/account.json'),
      role: global.SixCRM.routes.path('model','entities/role.json'),
      useracl: global.SixCRM.routes.path('model','entities/useracl.json'),
      user: global.SixCRM.routes.path('model','entities/user.json'),

    };

    this.parameter_definition = {
      invite:{
        required:{
          userinvite:'user_invite'
        },
        optional:{}
      },
      acceptInvite:{
        required:{
          invite: 'invite'
        },
        optional:{}
      },
      inviteResend:{
        required:{
          userinvite:'user_invite'
        },
        optional:{}
      }
    };

    const AccountController = global.SixCRM.routes.include('entities', 'Account.js');
    this.accountController = new AccountController();

    const RoleController = global.SixCRM.routes.include('entities', 'Role.js');
    this.roleController = new RoleController();

    const UserController = global.SixCRM.routes.include('entities', 'User.js');
    this.userController = new UserController();

    const UserACLController = global.SixCRM.routes.include('entities', 'UserACL.js');
    this.userACLController = new UserACLController();

    const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

  }

  invite(){

    du.debug('Invite');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'invite'}))
    .then(() => this.hydrateInviteProperties())
    .then(() => this.validateRequest())
    .then(() => this.createInviteACL())
    .then(() => this.sendInviteEmail())
    .then(() => this.postInvite())
    .then(() => {

      let link = this.parameters.get('invitelink');
      return {link: link};

    });

  }

  inviteResend() {

    du.debug('Invite Resend');

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'inviteResend'}))
    .then(() => this.hydrateInviteACL())
    .then(() => this.validateRequest())
    .then(() => this.sendInviteEmail())
    .then(() => this.postInviteResend())
    .then(() => {

      let link = this.parameters.get('invitelink');
      return {link: link};

    });

  }

  acceptInvite(){

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'acceptInvite'}))
    .then(() => {
      let invite = this.parameters.get('invite');
      let decoded_invite_parameters = this.decodeAndValidate(invite.token, invite.parameters);
      this.parameters.set('decodedinviteparameters', decoded_invite_parameters);
    })
    .then(() => this.assureUser())
    .then(() => this.updatePendingACL())
    .then(() => this.postAccept())
    .then(() => {
      //note:  this does not return a hydrated User any longer....
      return true;
    });

  }

  hydrateInviteProperties(){

    du.debug('Hydrate Invite Properties');

    let user_invite = this.parameters.get('userinvite');

    let properties = [];

    properties.push(this.accountController.get({id: user_invite.account}));
    properties.push(this.roleController.get({id: user_invite.role}));
    properties.push(this.userController.get({id: user_invite.email}));

    return Promise.all(properties).then(([account, role, user]) => {

      this.parameters.set('account', account);
      this.parameters.set('role', role);
      this.parameters.set('user', user);

      return true;

    });

  }

  validateRequest(){

    du.debug('Validate Request');

    //Technical Debt:  Finish...
    //Make sure that the global user has the ability to invite users on the account,
    //has the ability to invite with role,
    //user not already on the account...

    return true;

  }

  createInviteACL(){

    du.debug('Create Invite ACL');

    let user = this.parameters.get('user');
    let account = this.parameters.get('account');
    let role = this.parameters.get('role');

    const acl_object = {
      user: user.id,
      account: account.id,
      role: role.id,
      pending: 'Invite Sent'
    };

    return this.userACLController.create({entity: acl_object}).then(acl => {
      this.parameters.set('useracl', acl);
      return true;
    });

  }

  sendInviteEmail(){

    du.debug('Send Invite Email');

    let acl = this.parameters.get('useracl');
    let invitor = global.user.id;
    let account = this.parameters.get('account');
    let role = this.parameters.get('role');
    let user = this.parameters.get('user');

    const invite_parameters = {
      email: user.id,
      acl: acl.id,
      invitor: invitor,
      account: account.name,
      role: role.name
    };

    return this.executeSendInviteEmail(invite_parameters).then((link) => {
      this.parameters.set('invitelink', link);
      return true;
    });

  }

  postInvite(){

    du.debug('Post Invite');

    this.pushEvent({event_type: 'user_invited'});

    return true;

  }

  postInviteResend(){

    du.debug('Post Invite Resend');

    this.pushEvent({event_type: 'user_invite_resent'});

    return true;

  }

  postAccept(){

    du.debug('Post Accept');

    this.pushEvent({event_type: 'user_invite_accepted'});

    return true;

  }

  assureUser(){

    du.debug('Assure User');

    let decoded_invite_parameters = this.parameters.get('decodedinviteparameters');
    let user_id = decoded_invite_parameters.email;

    return this.userController.assureUser(user_id).then((user) => {
      this.parameters.set('user',user);
      return true;
    });

  }

  updatePendingACL(){

    du.debug('Update Pending ACL');

    let decoded_invite_parameters = this.parameters.get('decodedinviteparameters');

    return this.userACLController.get({id: decoded_invite_parameters.acl})
    .then((acl) => {

      if (!_.has(acl, 'pending')){
        eu.throwError('bad_request', 'User ACL is not pending.');
      }

      delete acl.pending;

      return this.userACLController.update({entity: acl}).then(() => {
        return true;
      });

    });

  }

  hydrateInviteACL(){

    du.debug('Hydrate Invite ACL');

    let user_invite = this.parameters.get('userinvite');

    return this.userACLController.get({id:user_invite.acl}).then(acl => {

      if(_.isNull(acl)){
        eu.throwError('bad_request','Non Existing User ACL.');
      }

      if (!_.has(acl, 'pending')){
        eu.throwError('bad_request','Can\'t resend invite, User ACL is not pending.');
      }

      this.parameters.set('useracl', acl);

      return acl;

    }).then((acl) => {

      let properties = [];

      properties.push(this.accountController.get({id: acl.account}));
      properties.push(this.roleController.get({id: acl.role}));
      properties.push(this.userController.get({id: acl.user}));

      return Promise.all(properties).then(([account, role, user]) => {

        this.parameters.set('account', account);
        this.parameters.set('role', role);
        this.parameters.set('user', user);

        return true;

      });

    });

  }

}
