const _ = require('lodash');
const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const AccountController = global.SixCRM.routes.include('entities', 'Account');
const SessionController = global.SixCRM.routes.include('entities', 'Session');
const accountController = new AccountController();
const sessionController = new SessionController();

module.exports = class DeactivateAccountController extends workerController {
	async execute(account_id) {
		const account = await accountController.get({ id: account_id });
		await Promise.all([
			this.removeBilling(account),
			this.cancelSessions(account)
		]);
	}

	async removeBilling(account) {
		delete account.billing;
		await accountController.update({
			entity: account,
			allow_billing_overwrite: true
		});
	}

	async cancelSessions(account) {
		const {sessions} = await sessionController.listByAccount({
			query_parameters: {
				FilterExpression: 'not_exists(#cancelled) AND not_exists(#concluded)',
				ExpressionAttributeNames: {
					'#cancelled': 'cancelled',
					'#concluded': 'concluded'
				}
			},
			account
		});

		if (_.isNull(sessions)) {
			return;
		}

		await Promise.all(sessions.map(entity => sessionController.cancelSession({entity})));
	}
}
