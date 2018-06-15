const _ = require('lodash');
const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const eu = require('@sixcrm/sixcrmcore/util/error-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const AuthenticatedController = global.SixCRM.routes.include('controllers', 'endpoints/components/authenticated.js');

module.exports = class CustomerAuthenticatedController extends AuthenticatedController {

	constructor(){

		super();

	}

	async acquireSubProperties(event){

		du.debug('Acquire Sub Properties');

		objectutilities.hasRecursive(event, 'requestContext.authorizer.customer', true);

		if(!_.has(this, 'customerController')){
			const CustomerController = global.SixCRM.routes.include('controllers', 'entities/Customer.js');
			this.customerController = new CustomerController();
		}

		this.customerController.disableACLs();
		let customer = await this.customerController.get({id: event.requestContext.authorizer.customer});
		this.customerController.enableACLs();

		if(_.isNull(customer)){
			throw eu.getError('not_found', 'Customer not found.');
		}

		if(customer.account !== global.account){
			throw eu.getError('bad_request', 'Customer account parity failure.');
		}

		if(!_.has(this, 'customerHelperController')){
			const CustomerHelperController = global.SixCRM.routes.include('helpers', 'entities/customer/Customer.js');
			this.customerHelperController = new CustomerHelperController();
		}

		customer = await this.appendCustomerACLs(customer);

		this.customerHelperController.setGlobalCustomer(customer);

		return event;

	}

	async appendCustomerACLs(customer){

		du.debug('Append Customer ALCs');

		let system_customer_role, account_customer_role;

		[system_customer_role, account_customer_role] = await Promise.all([
			this.getSystemCustomerRole(),
			this.getAccountCustomerRole()
		]);

		let customer_role = null;

		if(!_.isNull(system_customer_role)){

			if(!_.isNull(account_customer_role)){

				if(!_.has(this, 'roleHelperController')){
					const RoleHelperController = global.SixCRM.routes.include('helpers', 'entities/role/Role.js');
					this.roleHelperController = new RoleHelperController();
				}

				customer_role = this.roleHelperController.roleIntersection(system_customer_role, account_customer_role);

			}else{

				customer_role = system_customer_role;

			}

		}else{

			customer_role = {
				permissions: {
					allow: [
						'session/read',
						'session/update',
						'customer/read',
						'customer/update',
						'creditcard/read',
						'creditcard/create',
						'creditcard/update',
						'rebill/read',
						'rebill/update',
						'transaction/read',
						'shippingreceipt/read',
						'campaign/read',
						'fulfillmentprovider/read',
						'merchantprovider/read',
						'product/read',
						'productschedule/read',
						'return/read'
					],
					deny:[
						'*'
					]
				}
			};

		}

		customer.acl = customer_role.permissions;

		return customer;

	}

	async getSystemCustomerRole(){

		du.debug('Get System Customer Role');

		if(!_.has(this, 'roleController')){
			const RoleController = global.SixCRM.routes.include('entities', 'Role.js');
			this.roleController = new RoleController();
		}

		let role = await this.roleController.getShared({id: '3f4b642d-1eb7-4924-91d2-85db155ce943'});

		return role;

	}

	async getAccountCustomerRole(){

		du.debug('Get Account Customer Role');

		return null;

	}

}
