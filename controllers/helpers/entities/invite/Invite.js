const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const signatureutilities = global.SixCRM.routes.include('lib', 'signature.js');
const jwtutilities = global.SixCRM.routes.include('lib', 'jwt-utilities.js');

const InviteUtilities = global.SixCRM.routes.include('helpers', 'entities/invite/InviteUtilities.js');

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

		const InviteController = global.SixCRM.routes.include('entities', 'Invite.js');
		this.inviteController = new InviteController();

		const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');
		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

		this.invite_salt = 'auiwdhp98a0fj[ani0aco]';
	}

	async acknowledge(hash){

		du.debug('Acknowledge');

		this.inviteController.disableACLs();
		let invite = 	await this.inviteController.getByHash(hash);
		this.inviteController.enableACLs();

		if(_.isNull(invite)){
			throw eu.getError('not_found', 'Invite not found.');
		}

		invite.signature = this._createInviteSignature(invite);

		return invite;

	}

	async accept({hash, signature}){

		du.debug('Accept');

		this.inviteController.disableACLs();
		let invite = 	await this.inviteController.getByHash(hash);
		this.inviteController.enableACLs();

		if(_.isNull(invite)){
			throw eu.getError('not_found', 'Invite not found.');
		}

		if(signature !== this._createInviteSignature(invite)){
			throw eu.getError('bad_request', 'Invalid invite signature');
		}

		const user = await this._acceptInvite(invite);

		return Promise.resolve({
			is_new: user.is_new,
			account: invite.account
		});

	}

	async _acceptInvite(invite){

		du.debug('Accept Invite');

		this.parameters.set('invite', invite)

		await this._updatePendingACL(invite.acl);
		const user = await this._assureUser(invite.email);
		await this._removeInvite(invite);
		await this._postAccept();

		return user;

	}

	async _removeInvite(invite){

		du.debug('Remove Invite');

		this.inviteController.disableACLs();
		await this.inviteController.delete({id: invite.id});
		this.inviteController.enableACLs();

		return true;

	}

	_createSiteJWT(user){

		du.debug('Create Site JWT');

		return jwtutilities.createSiteJWT(user);

	}

	_createInviteSignature(invite){

		du.debug('Create Invite Signature');

		if(_.has(invite, 'hash') && _.has(invite, 'timestamp')){
			const prehash = invite.hash+invite.timestamp;
			return signatureutilities.createSignature(prehash, this.invite_salt);
		}

		throw eu.getError('server', 'Invite missing required properties: ', invite);

	}

	invite(){

		du.debug('Invite');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'invite'}))
			.then(() => this._hydrateInviteProperties())
			.then(() => this._validateRequest())
			.then(() => this._createInviteACL())
			.then(() => this._sendInviteEmail())
			.then(() => this._postInvite())
			.then(() => {

				let link = this.parameters.get('invitelink');
				return {link: link};

			});

	}

	inviteResend() {

		du.debug('Invite Resend');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'inviteResend'}))
			.then(() => this._hydrateInviteACL())
			.then(() => this._validateRequest())
			.then(() => this._sendInviteEmail())
			.then(() => this._postInviteResend())
			.then(() => {

				let link = this.parameters.get('invitelink');
				return {link: link};

			});

	}

	_hydrateInviteProperties(){

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

	_validateRequest(){

		du.debug('Validate Request');

		//Technical Debt:  Finish...
		//Make sure that the global user has the ability to invite users on the account,
		//has the ability to invite with role,
		//user not already on the account...

		return true;

	}

	async _createInviteACL(){

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

		const acl = await this.userACLController.create({entity: acl_object});

		this.parameters.set('useracl', acl);
		return true;

	}

	async _sendInviteEmail(){

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

		const link = await this.executeSendInviteEmail(invite_parameters);
		this.parameters.set('invitelink', link);

		return true;

	}

	_postInvite(){

		du.debug('Post Invite');

		return this.pushEvent({event_type: 'user_invited'});

	}

	_postInviteResend(){

		du.debug('Post Invite Resend');

		return this.pushEvent({event_type: 'user_invite_resent'});

	}

	_postAccept(){

		du.debug('Post Accept');

		return this.pushEvent({event_type: 'user_invite_accepted'});

	}

	async _assureUser(email){

		du.debug('Assure User');

		let new_user = false;

		this.userController.disableACLs();
		let user = await this.userController.get({id: email});
		this.userController.enableACLs();

		if(!_.isNull(user)){

			new_user = true;

			this.userController.disableACLs();
			user = await this.userController.assureUser(email);
			this.userController.enableACLs();

		}

		user.is_new = new_user;
		return user;

	}

	async _updatePendingACL(acl_id){

		du.debug('Update Pending ACL');

		this.userACLController.disableACLs();
		let acl = await this.userACLController.get({id: acl_id});
		this.userACLController.enableACLs();

		if(_.isNull(acl)){
			throw eu.getError('bad_request', 'Missing User ACL.');
		}

		if (!_.has(acl, 'pending')){
			throw eu.getError('bad_request', 'User ACL is not pending.');
		}

		delete acl.pending;

		this.userACLController.disableACLs();
		await this.userACLController.update({entity: acl});
		this.userACLController.enableACLs();

		return true;

	}

	_hydrateInviteACL(){

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
