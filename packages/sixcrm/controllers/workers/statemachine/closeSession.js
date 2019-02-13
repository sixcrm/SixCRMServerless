const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const stepFunctionWorkerController = global.SixCRM.routes.include('controllers', 'workers/statemachine/components/stepFunctionWorker.js');

const SessionController = global.SixCRM.routes.include('entities', 'Session.js');
const TrialConfirmationController = global.SixCRM.routes.include('entities', 'TrialConfirmation');
const sessionController = new SessionController();
const trialConfirmationController = new TrialConfirmationController();

module.exports = class CloseSessionController extends stepFunctionWorkerController {
	constructor() {
		super();
	}

	async execute(event) {
		this.validateEvent(event);

		let session = await this.getSession(event.guid);
		session.completed = true;
		await this.handleTrialConfirmation(session);
		await sessionController.update({entity: session});

		return this.respond();
	}

	async handleTrialConfirmation(session) {
		const trialProductSchedule = session.watermark.product_schedules.find(ps => ps.product_schedule.trial_required);

		if (!trialProductSchedule) {
			du.debug(`Trial confirmation not required for session with id ${session.id}`);
			return session;
		}

		const confirmation = await trialConfirmationController.create({
			session: session.id,
			customer: session.customer,
			sms_provider: trialProductSchedule.product_schedule.trial_sms_provider
		});

		session.trial_confirmation = confirmation.id;
	}

	respond(){
		return 'CLOSED';
	}
}
