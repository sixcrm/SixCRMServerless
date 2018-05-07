const _ = require('lodash');
const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt: Override the list method
class AccountController extends entityController {

	constructor() {

		super('account');

		this.search_fields = ['name'];

	}

	create({
		entity
	}) {

		du.debug('Account.create()');

		this.supplyLowercaseName({
			entity: entity
		});

		return this.verifyAccountName({
			entity: entity
		}).then(() => super.create({
			entity: entity
		}));

	}

	update({
		entity,
		ignore_updated_at,
		allow_billing_overwrite = false
	}) {

		du.debug('Account.update()');

		return this.exists({
			entity: entity,
			return_entity: true
		})
			.then((result) => {
				this.supplyLowercaseName({
					entity: entity
				});
				if (allow_billing_overwrite !== true) {
					delete entity.billing;
					if (_.has(result, 'billing')) {
						entity.billing = result.billing
					}
				}
				return entity;
			})
			.then((entity) => {
				return this.verifyAccountName({
					entity: entity
				})
			})
			.then((entity) => super.update({
				entity: entity,
				ignore_updated_at: ignore_updated_at
			}));

	}

	//Technical Debt: finish!
	associatedEntitiesCheck() {
		return Promise.resolve([]);
	}

	//Technical Debt:  Shouldn't this be configured?
	getMasterAccount() {

		du.debug('Get Master Account');

		return Promise.resolve({
			"id": "*",
			"name": "Master Account",
			"active": true
		});

	}

	//Technical Debt:  Name seems ubiquitous
	getACL(account) {

		du.debug('Get ACL');

		return this.executeAssociatedEntityFunction('userACLController', 'getACLByAccount', {
			account: account
		});

	}

	//Technical Debt:  This needs to be adjusted.  Master users should see all accounts but non-master users should see all accounts that they have ACLs on.
	list({
		pagination,
		fatal
	}) {

		du.debug("List");

		let query_parameters = {};

		if (global.account !== '*') {

			query_parameters = this.appendFilterExpression(query_parameters, 'id = :accountv');
			query_parameters = this.appendExpressionAttributeValues(query_parameters, ':accountv', global.account);
			pagination = null;

		}

		return super.list({
			query_parameters: query_parameters,
			pagination: pagination,
			fatal: fatal
		});

	}

	supplyLowercaseName({
		entity
	}) {

		du.deep('Supply Lowercase Name');

		entity.name_lowercase = entity.name.toLowerCase();
	}

	verifyAccountName({
		entity
	}) {

		du.debug('Verify Account Name');

		let query_parameters = this.createINQueryParameters({
			field: 'name_lowercase',
			list_array: [entity.name_lowercase]
		});

		du.debug('Query parameters', query_parameters);

		return super.list({
			query_parameters: query_parameters
		})
			.then(response => {

				du.debug('Accounts with name ' + entity.name, response ? response.accounts : []);

				if (
					objectutilities.hasRecursive(response, 'accounts') &&
					arrayutilities.isArray(response.accounts) &&
					arrayutilities.filter(response.accounts, (account) => account.id !== entity.id).length > 0
				) {

					du.error('An account already exists with name: "' + entity.name + '"');
					throw eu.getError('bad_request', 'An account already exists with name: "' + entity.name + '"')
				}

				return entity;

			});

	}

}

module.exports = AccountController;
