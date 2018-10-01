const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const AccountController = global.SixCRM.routes.include('entities', 'Account');
const SessionController = global.SixCRM.routes.include('entities', 'Session');
const accountController = new AccountController();
const sessionController = new SessionController();

module.exports = class GetAccountForCustomerController extends workerController {
	async execute(customer) {
		const {session} = await sessionController.getBySecondaryIndex({
			field: 'customer',
			index_name: 'customer-index',
			index_value: customer.id,
			query_parameters: {
				filter_expression: '#account = :billingaccount AND not_exists(#cancelled) AND not_exists(#concluded)',
				expression_attribute_names: {
					'#account': 'account',
					'#cancelled': 'cancelled',
					'#concluded': 'concluded'
				},
				expression_attribute_values: {
					':billingaccount': '3f4abaf6-52ac-40c6-b155-d04caeb0391f'
				}
			}
		});

		if (_.isNull(session)) {
			throw eu.getError('server', 'Could not find billing session for customer');
		}

		const {accounts} = await accountController.list({
			query_parameters: {
				filter_expression: '#billing.#session = :session',
				expression_attribute_names: {
					'#billing': 'billing',
					'#session': 'session'
				},
				expression_attribute_values: {
					':session': session.id
				}
			}
		});

		if (_.isNull(accounts)) {
			throw eu.getError('server', 'Could not find account for billing session');
		}

		return accounts[0];
	}
}
