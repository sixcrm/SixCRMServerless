const workerController = global.SixCRM.routes.include('controllers', 'workers/components/worker.js');
const AccountController = global.SixCRM.routes.include('entities', 'Account');
const SessionController = global.SixCRM.routes.include('entities', 'Session');
const EventPushHelperController = global.SixCRM.routes.include('helpers', 'events/EventPush.js');

const accountController = new AccountController();
const sessionController = new SessionController();
const eventPushHelperController = new EventPushHelperController();

module.exports = class SendBillingFailedController extends workerController {
	constructor() {
		super();
		this.permissionutilities.setGlobalAccount('3f4abaf6-52ac-40c6-b155-d04caeb0391f');
	}

	async execute(account_id) {
		const account = await accountController.get({ id: account_id });
		const session = await sessionController.get({ id: account.billing.session });

		await eventPushHelperController.pushEvent({
			event_type: 'billing_failed',
			context: {
				customer: session.customer,
				campaign: session.campaign
			}
		});
	}
}
