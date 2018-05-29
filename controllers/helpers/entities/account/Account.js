const _ = require('lodash');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const numberutilities = global.SixCRM.routes.include('lib', 'number-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const AccountController = global.SixCRM.routes.include('entities', 'Account.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const RebillController = global.SixCRM.routes.include('entities', 'Rebill.js');
const UserACLController = global.SixCRM.routes.include('entities', 'UserACL.js');

const UserACLHelperController = global.SixCRM.routes.include('helpers', 'entities/useracl/UserACL.js');

module.exports = class AccountHelperController {

	constructor(){

		//Technical Debt:  This should be config'd somewhere outside of the codebase
		this.subscription_products = {
			'3ac1a59a-6e41-4074-9712-3c80ef3f3e95':{name: 'basic'},
			'89c38a3b-dbee-4429-8627-cfe300f3c519':{name: 'professional'},
			'96ef7ffd-0ee3-4436-9782-0d1a6f4f81f0':{name: 'premium'}
		};

	}

	getAccountPrototype({account}){

		du.debug('getAccountPrototype');

		const prototype = {
			active: true
		};

		return objectutilities.transcribe(
			{
				'name':'name'
			},
			account,
			prototype,
			true
		);

	}

	async createNewAccount({account}){

		du.debug('New Account');

		if(!_.has(global, 'user')){
			throw eu.getError('server', 'User not set.');
		}

		let user = global.user;

		account = this.getAccountPrototype({account: account});

		if(!_.has(this, 'accountController')){
			this.accountController = new AccountController();
		}

		this.accountController.disableACLs();
		account = await this.accountController.create({entity:account, disable_permissions: true});
		this.accountController.enableACLs();

		let role = {id: this._getOwnerRoleId()};

		const userACLHelperController = new UserACLHelperController();
		await userACLHelperController.createNewUserACL({account: account, user: user, role: role});

		return account;

	}

	isAccountDisabled(account){

		du.debug('Is Account Disabled');

		du.info(account);

		if(!_.has(account, 'billing')){
			du.warning('Account not active:  Missing billing properties.');
			return true;
		}

		if(objectutilities.hasRecursive(account, 'billing.disable') && account.billing.disable < timestamp.getISO8601()){
			du.warning('Account not active:  Disable date has passed.');
			return true;
		}

		return false;

	}

	getPrototypeAccount(email){

		du.debug('Create Prototype Account');

		let account_id = stringutilities.getUUID();

		let proto_account = {
			id: account_id,
			name: email+'-pending-name',
			active: true
		};

		return proto_account;

	}

	async validateAccount(account = null, fatal = true){

		du.debug('Validate Account');

		if(_.isNull(account)){
			if(!_.has(global, 'account')){
				throw eu.getError('server', 'Global missing account variable.');
			}
			account = global.account;
		}

		account = await this._getAccount(account, true);

		if(account.active !== true && fatal == true){
			throw eu.getError('forbidden', 'This account is not available for API requests at this time.');
		}

		return account.active;

	}

	async activateAccount({account, session}){

		du.debug('Activate Account');

		session = await this._getSession(session);
		account = await this._getAccount(account, true);

		await this._validateSessionForAccountActivation({session: session, account: account});

		const plan = await this._getPlanName({session: session});

		account['billing'] = {
			session: (_.has(session, 'id'))?session.id:session,
			plan: plan
		};

		if(!_.has(this, 'accountController')){
			this.accountController = new AccountController();
		}

		this.accountController.disableACLs();
		account = await this.accountController.update({entity:account, allow_billing_overwrite: true});
		this.accountController.enableACLs();

		return {
			activated: true,
			message: 'Successfully activated account'
		};

	}

	async deactivateAccount({account}){

		du.debug('Deactivate Account');

		account = await this._getAccount(account);

		if(!_.has(account, 'billing')){
			throw eu.getError('server', 'Account does not have a billing property.');
		}

		if(_.has(account.billing, 'deactivate')){
			throw eu.getError('bad_request', 'Account is already scheduled for deactivation.');
		}

		if(_.has(account.billing, 'deactivated') && account.billing.deactivated == true){
			throw eu.getError('bad_request', 'Account is already deactivated.');
		}

		let deactivate_time = timestamp.getISO8601();
		account.billing.deactivate = deactivate_time

		if(!_.has(this, 'accountController')){
			this.accountController = new AccountController();
		}

		this.accountController.disableACLs();
		account = await this.accountController.update({entity:account, allow_billing_overwrite: true});
		this.accountController.enableACLs();

		return {
			deactivate: deactivate_time,
			message: "Successfully scheduled account deactivation"
		};

	}

	async cancelDeactivation({account}){

		du.debug('Deactivate Account');

		account = await this._getAccount(account);

		if(!_.has(account, 'billing')){
			throw eu.getError('server', 'Account does not have a billing property.');
		}

		if(!_.has(account.billing, 'deactivate')){
			throw eu.getError('bad_request', 'Account is not scheduled for deactivation');
		}

		if(_.has(account.billing, 'deactivated') && account.billing.deactivated == true){
			throw eu.getError('bad_request', 'Account is already deactivated.');
		}

		delete account.billing.deactivate;

		if(!_.has(this, 'accountController')){
			this.accountController = new AccountController();
		}

		this.accountController.disableACLs();
		account = await this.accountController.update({entity:account, allow_billing_overwrite: true});
		this.accountController.enableACLs();

		return {
			message: "Deactivation Cancelled"
		};

	}

	async upgradeAccount({account, plan}){

		du.debug('Upgrade Account');

		account = await this._getAccount(account);

		if(!_.has(account, 'billing')){
			throw eu.getError('server', 'Account does not have a billing property.');
		}

		if(!this._isUpgrade({plan: plan, account: account})){
			throw eu.getError('bad_request', 'Plan is not an upgrade from current plan.');
		}

		let new_session = await this._billNewPlan({account: account, plan: plan});

		await this._validateSessionForAccountActivation({session: new_session, account: account});

		account.billing.plan = plan;

		if(!_.has(account.billing, 'previous_sessions')){
			account.billing.previous_sessions = [];
		}
		account.billing.previous_sessions.push(account.billing.session);
		account.billing.session = new_session.id;

		return {
			upgraded: true,
			message: 'Successfully activated account'
		};

	}

	async _billNewPlan({account, plan}){

		du.debug('Bill New Plan');
		du.info(account, plan);
		//Technical Debt:  Complete me.
		return null;

	}

	_isUpgrade({plan, account}){

		du.debug('Is Upgrade');

		if(plan == 'basic'){
			return false;
		}

		if(plan == account.billing.plan){
			return false;
		}

		if(account.billing.plan == 'premium'){
			return false;
		}

		return true;

	}

	async _getAccount(account_id, disable_acls = false){

		du.debug('Get Account');

		if(!_.has(this, 'accountController')){
			this.accountController = new AccountController();
		}

		if(disable_acls){ this.accountController.disableACLs(); }
		let account = await this.accountController.get({id: account_id});
		if(disable_acls){ this.accountController.enableACLs(); }

		if(_.isNull(account)){
			throw eu.getError('bad_request', 'Account not found.');
		}

		return account;

	}

	async _getSession(session_id){

		du.debug('Get Account');

		if(!_.has(this, 'sessionController')){
			this.sessionController = new SessionController();
		}

		//Note this is always disabled because the sessions belong to the Accounting account
		this.sessionController.disableACLs();
		let session = await this.sessionController.get({id: session_id});
		this.sessionController.enableACLs();

		if(_.isNull(session)){
			throw eu.getError('bad_request', 'Session not found.');
		}

		return session;

	}

	async _getPlanName({session}){

		let products = this._getSessionSubscriptionProducts({session: session});

		if(!arrayutilities.nonEmpty(products)){
			throw eu.getError('bad_request', 'No subscription products are included in the session.');
		}

		if(products.length > 1){
			throw eu.getError('bad_request', 'More than one subscription product is included in the session.');
		}

		if(!_.has(this.subscription_products, products[0].id)){
			throw eu.getError('server', 'Failed to identify subscription product: '+products[0]);
		}

		if(!_.has(this.subscription_products[products[0].id], 'name')){
			throw eu.getError('server', 'Failed to identify subscription product name: '+products[0]);
		}

		return this.subscription_products[products[0].id].name;

	}

	//Technical Debt:  This belongs in the Session Helper
	_getSessionSubscriptionProducts({session}){

		du.debug('Get Session Subscription Products');

		let products = [];

		if(objectutilities.hasRecursive(session, 'watermark.product_schedules') && arrayutilities.nonEmpty(session.watermark.product_schedules)){

			arrayutilities.map(session.watermark.product_schedules, product_schedule_group => {

				if(product_schedule_group.quantity < 1){
					return false;
				}

				if(!objectutilities.hasRecursive(product_schedule_group, 'product_schedule.schedule') || !arrayutilities.nonEmpty(product_schedule_group.product_schedule.schedule)){
					return false;
				}

				arrayutilities.map(product_schedule_group.product_schedule.schedule, (schedule_element) => {
					if(objectutilities.hasRecursive(schedule_element, 'product.id') && _.has(this.subscription_products, schedule_element.product.id)){
						products.push(schedule_element.product);
					}
				});

			});

		}

		return products;

	}

	async _validateSessionForAccountActivation({session, account}){

		du.debug('Validate Session For Account Activation');

		if(session.account !== this._getSixCRMBillingAccountIdentifier()){
			throw eu.getError('bad_request', 'Session is inappropriate for account activation');
		}

		await this._validateSessionCustomerForAccountActivation({session: session, account: account});
		await this._validateSessionWatermarkForAccountActivation({session: session});
		await this._validateSessionPaymentHistory({session: session});

		return true;

	}

	async _validateSessionPaymentHistory({session}){

		du.debug('Validate Session Payment History');

		if(!_.has(this, 'rebillController')){
			this.rebillController = new RebillController();
		}

		if(!_.has(this, 'sessionController')){
			this.sessionController = new SessionController();
		}

		this.sessionController.disableACLs();
		let rebills = await this.sessionController.listRebills(session);
		this.sessionController.enableACLs();

		if(_.isNull(rebills) || !arrayutilities.nonEmpty(rebills)){
			throw eu.getError('server', 'Session missing rebills.');
		}

		//Note:  Note that this is actually a bit complicated.
		//When a user has one or more declines before paying for a aubscription, there are more than 1 rebill associated with the session, not all of which have corresponding paid rebills.
		//So instead of looking for unpaid rebills, we look for a paid rebill
		//Technical Debt:  Revisit, fix.

		let paid_promises = arrayutilities.map(rebills, async (rebill) => {

			this.rebillController.disableACLs();
			let transactions = await this.rebillController.listTransactions(rebill);
			this.rebillController.enableACLs();

			transactions = transactions.transactions;

			if(!arrayutilities.nonEmpty(transactions)){
				throw eu.getError('bad_request', 'The provided session does not have associated transactions.');
			}

			let rebill_sum = this._sumRebillTransactions(transactions);

			if(rebill_sum == rebill.amount){
				return rebill;
			}
			return null;
		});

		let paid_rebills = await Promise.all(paid_promises);

		paid_rebills = arrayutilities.filter(paid_rebills, paid_rebill => {
			return (_.has(paid_rebill, 'id'));
		});

		if(paid_rebills.length > 0){
			return true;
		}

		throw eu.getError('bad_request', 'Session does not have a appropriate, paid rebill.');

	}

	_sumRebillTransactions(transactions){

		du.debug('Sum Rebill Transactions');

		let sum = 0.00;
		arrayutilities.map(transactions, transaction => {
			if(transaction.result == 'success' && transaction.type == 'sale'){
				sum += numberutilities.toNumber(transaction.amount);
			}
		});

		return sum;

	}

	_getSixCRMBillingAccountIdentifier(){

		du.debug('Get SixCRM Billing Account Identifier');

		return '3f4abaf6-52ac-40c6-b155-d04caeb0391f';

	}

	async _validateSessionCustomerForAccountActivation({session, account}){

		du.debug('Validate Session Customer For Account Activation');

		if(!_.has(this, 'sessionController')){
			this.sessionController = new SessionController();
		}

		this.sessionController.disableACLs();
		let customer = await this.sessionController.getCustomer(session);
		this.sessionController.enableACLs();

		this.accountController.disableACLs();
		let account_owner = await this._getAccountOwner({account: account});
		this.accountController.enableACLs();

		if(account_owner !== customer.email){
			throw eu.getError('bad_request', 'The session customer does not match the account owner.');
		}

		return true;

	}

	async _getAccountOwner({account}){

		du.debug('Get Account Owner');

		if(!_.has(this, 'userACLController')){
			this.userACLController = new UserACLController();
		}

		this.userACLController.disableACLs();
		let acls = await this.userACLController.getACLByAccount({account: account});
		this.userACLController.enableACLs();

		let owner = arrayutilities.find(acls, acl => {
			return (acl.role == this._getOwnerRoleId());
		});

		if(!_.has(owner, 'user')){
			throw eu.getError('server', 'Unable to identify account owner');
		}

		return owner.user;

	}

	//This should exist in the Role Helper
	_getOwnerRoleId(){

		du.debug('Get Owner Role ID');

		return 'cae614de-ce8a-40b9-8137-3d3bdff78039';

	}

	async _validateSessionWatermarkForAccountActivation({session}){

		du.debug('Validate Session Watermark For Account Activation');

		let subscription_products = this._getSessionSubscriptionProducts({session});

		if(!arrayutilities.nonEmpty(subscription_products)){
			throw eu.getError('bad_request', 'The session does not contain appropriate subscription products.');
		}

		return true;

	}

}
