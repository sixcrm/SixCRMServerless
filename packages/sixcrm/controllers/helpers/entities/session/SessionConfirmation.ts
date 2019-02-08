require('module-alias/register');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

const SessionController = require('@root/controllers/entities/Session.js');
const CustomerController = require('@root/controllers/entities/Customer.js');
const TrialConfirmationController = require('@root/controllers/entities/TrialConfirmation.js');
const TwilioProvider = require('@lib/controllers/providers/twilio-provider.js').default;

export default class SessionConfirmation {

	private readonly sessionController = new SessionController();
	private readonly customerController = new CustomerController();
	private readonly trialconfirmationController = new TrialConfirmationController();
	private readonly twilioProvider = new TwilioProvider();

	private async sendDeliveryConfirmationSms(phone: string, code: string) {
		du.debug('sendDeliveryConfirmationSms', phone, code);

		const message = `Please confirm package delivery at https://development-admin.sixcrm.com/confirm/${code}`;

		await this.twilioProvider.sendSMS(message, phone);
	}

	async confirmTrialDelivery(sessionId: string) {
		du.debug('confirmTrialDelivery', sessionId);

		const session = await this.sessionController.get({id: sessionId, fatal: true});
		this.assure(session, `Can't find session with ID ${sessionId}`);
		this.assure(session.trial_confirmation, `Session with ID ${sessionId} has no trial confirmation.`);

		const customer = await this.customerController.get({id: session.customer,  fatal: true});
		this.assure(customer, `Can't find customer with ID ${session.customer}`);

		const confirmation = await this.trialconfirmationController.get({id: session.trial_confirmation, fatal: true});
		this.assure(confirmation, `Can't find confirmation with ID ${session.trial_confirmation}`);

		await this.trialconfirmationController.markDelivered({confirmation});
		await this.sendDeliveryConfirmationSms(customer.phone, confirmation.code);
	}

	async confirmTrial(code: string) {
		du.debug('confirmTrial', code);

		const confirmation = await this.trialconfirmationController.getByCode({code});

		await this.trialconfirmationController.markConfirmed(confirmation);

		// TODO continue with rebill creator
		// ...
	}

	assure(object: any, message: string) {
		if (object) {
			return;
		}

		du.error(message);
		eu.throw('bad_request', message);
	}

}
