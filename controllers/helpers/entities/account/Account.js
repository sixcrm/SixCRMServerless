const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

const AccountController = global.SixCRM.routes.include('entities', 'Account.js');
const SessionController = global.SixCRM.routes.include('entities', 'Session.js');

module.exports = class AccountHelperController {

	constructor(){

		//Technical Debt:  This should be config'd somewhere outside of the codebase
		this.subscription_products = {
			'3ac1a59a-6e41-4074-9712-3c80ef3f3e95':{name: 'basic'},
			'89c38a3b-dbee-4429-8627-cfe300f3c519':{name: 'professional'},
			'96ef7ffd-0ee3-4436-9782-0d1a6f4f81f0':{name: 'premium'}
		};

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

		if(!_.has(this, 'accountController')){
			this.accountController = new AccountController();
		}

		this.accountController.disableACLs();
		let result = await this.accountController.get({id: account});
		this.accountController.enableACLs();

		if(_.isNull(result)){
			throw eu.getError('not_found', 'Account not found: '+account);
		}

		if(result.active !== true && fatal == true){
			throw eu.getError('forbidden', 'This account is not available for API requests at this time.');
		}

		return result.active;

	}

	async activateAccount({account, session}){

		du.debug('Activate Account');

		if(!_.has(this, 'sessionController')){
			this.sessionController = new SessionController();
		}

		this.sessionController.disableACLs();
		session = await this.sessionController.get({id: session});
		this.sessionController.enableACLs();

		if(_.isNull(session)){
			throw eu.getError('bad_request', 'Session not found.');
		}

		if(!_.has(this, 'accountController')){
			this.accountController = new AccountController();
		}

		this.accountController.disableACLs();
		account = await this.accountController.get({id: account});
		this.accountController.enableACLs();

		if(_.isNull(account)){
			throw eu.getError('bad_request', 'Account not found.');
		}

		await this._validateSessionForAccountActivation({session: session, account: account});

		const plan = await this._getPlanName({session: session});

		account['billing'] = {
			session: session,
			plan: plan,
			disabled: false
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

	_getSessionSubscriptionProducts({session}){

		du.debug('Get Session Subscription Products');

		let products = [];

		if(objectutilities.hasRecursive(session, 'watermark.product_schedules') && true/*arrayutilities.nonEmpty(session.watermark.product_schedules)*/){

			arrayutilities.map(session.watermark.product_schedules, product_schedule_group => {

				if(product_schedule_group.quantity < 1){
					return false;
				}

				if(!_.has(product_schedule_group, 'schedule') || !arrayutilities.nonEmpty(product_schedule_group.schedule)){
					return false;
				}

				arrayutilities.map(product_schedule_group.schedule, (schedule_element) => {
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

	async _validateSessionPaymentHistory(){

		du.debug('Validate Session Payment History');

		//session has no bills with unpaid rebills
		//matches appropriate amount

		return true;

	}

	_getSixCRMBillingAccountIdentifier(){

		du.debug('Get SixCRM Billing Account Identifier');

		return '3f4abaf6-52ac-40c6-b155-d04caeb0391f';

	}

	async _validateSessionCustomerForAccountActivation({session, account}){

		du.debug('Validate Session Customer For Account Activation');

		du.info(session, account);
		//get account owner role
		//get sessioncustomer
		//make sure it matches the session customer email
		return true;

	}

	async _validateSessionWatermarkForAccountActivation({session, account}){
		//matches appropriate product schedule ids
		//matches appropriate product ids
		du.info(session, account);
		return true;

	}

}
