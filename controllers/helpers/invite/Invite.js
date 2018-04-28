const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const InviteUtilities = global.SixCRM.routes.include('helpers', 'invite/InviteUtilities.js');
const InviteController = global.SixCRM.routes.include('entities', 'Invite.js');

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
					hash: 'hash'
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
			.then(() => this.translateHash())
			.then(() => this.assureUser())
			.then(() => this.updatePendingACL())
			.then(() => this.postAccept())
			.then(() => {
				return this.parameters.get('user');
			});

	}

	translateHash(){

		du.debug('Translate Hash');

		let hash = this.parameters.get('hash');

		const inviteController = new InviteController();

		return inviteController.getByHash(hash).then((result) => {
			if(_.isNull(result)){
				throw eu.getError('not_found', 'Invite not found.');
			}
			this.parameters.set('invite', result);
			return true;
		});

	}

	hydrateInviteProperties(){

		du.debug('Hydrate Invite Properties');

		let user_invite = this.parameters.get('userinvite');

		let properties = [];

		properties.push(this.accountController.get({id: user_invite.account}));
		properties.push(this.roleController.get({id: user_invite.role}));
		properties.push(this.userController.assureUser(user_invite.email));
		properties.push(this.roleController.getShared({id: user_invite.role}));

		return Promise.all(properties).then(([account, role, user, shared_role]) => {

			this.parameters.set('account', account);
			if (role) {
				this.parameters.set('role', role);
			} else {
				this.parameters.set('role', shared_role);
			}
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
			account_name: account.name,
			account: account.id,
			role: role.name
		};

		return this.executeSendInviteEmail(invite_parameters).then((link) => {
			this.parameters.set('invitelink', link);
			return true;
		});

	}

	postInvite(){

		du.debug('Post Invite');

		return this.pushEvent({event_type: 'user_invited'});

	}

	postInviteResend(){

		du.debug('Post Invite Resend');

		return this.pushEvent({event_type: 'user_invite_resent'});

	}

	postAccept(){

		du.debug('Post Accept');

		return this.pushEvent({event_type: 'user_invite_accepted'});

	}

	assureUser(){

		du.debug('Assure User');

		let invite = this.parameters.get('invite');
		let user_id = invite.email;

		return this.userController.assureUser(user_id).then((user) => {
			this.parameters.set('user', user);
			return true;
		});

	}

	updatePendingACL(){

		du.debug('Update Pending ACL');

		let invite = this.parameters.get('invite');

		return this.userACLController.get({id: invite.acl})
			.then((acl) => {

				if (!_.has(acl, 'pending')){
					throw eu.getError('bad_request', 'User ACL is not pending.');
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
				throw eu.getError('bad_request','Non Existing User ACL.');
			}

			if (!_.has(acl, 'pending')){
				throw eu.getError('bad_request','Can\'t resend invite, User ACL is not pending.');
			}

			this.parameters.set('useracl', acl);

			return acl;

		}).then((acl) => {

			let properties = [];

			properties.push(this.accountController.get({id: acl.account}));
			properties.push(this.roleController.get({id: acl.role}));
			properties.push(this.userController.get({id: acl.user}));
			properties.push(this.roleController.getShared({id: acl.role}));

			return Promise.all(properties).then(([account, role, user, shared_role]) => {

				this.parameters.set('account', account);
				if (role) {
					this.parameters.set('role', role);
				} else {
					this.parameters.set('role', shared_role);
				}
				this.parameters.set('user', user);

				return true;

			});

		});

	}

}
