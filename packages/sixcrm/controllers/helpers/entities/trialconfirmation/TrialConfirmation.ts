require('module-alias/register');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const _ = require('lodash');

const SessionController = require('@root/controllers/entities/Session.js');
const CustomerController = require('@root/controllers/entities/Customer.js');
const TrialConfirmationController = require('@root/controllers/entities/TrialConfirmation.js');
const SMSProvider = require('@root/controllers/entities/SMSProvider.js');

export default class TrialConfirmation {

	private readonly sessionController = new SessionController();
	private readonly customerController = new CustomerController();
	private readonly trialconfirmationController = new TrialConfirmationController();
	private readonly smsProviderController = new SMSProvider();

	private async sendDeliveryConfirmationSms(phone: string, code: string, provider_id: string) {
		du.debug('sendDeliveryConfirmationSms', phone, code);

		const message = `Please confirm your trial at ${this.buildConfirmationLink(code)}`;

		return this.smsProviderController.sendSMS(provider_id, phone, message);
	}

	private buildConfirmationLink(code: string) {
		const domain = _(global).get('SixCRM.configuration.site_config.site.domain');
		const include_stage = _(global).get('SixCRM.configuration.site_config.site.include_stage');
		const stage = process.env.stage;
		const api_url = `https://${include_stage ? stage+'-' : ''}api.${domain}`;

		return `${api_url}/confirm/${code}`;
	}

	async confirmTrialDelivery(sessionId: string, markAsDelivered = true) {
		du.debug('confirmTrialDelivery', sessionId, markAsDelivered);

		const session = await this.sessionController.get({id: sessionId, fatal: true});
		this.assure(session, `Can't find session with ID ${sessionId}`);
		this.assure(session.trial_confirmation, `Session with ID ${sessionId} has no trial confirmation.`);

		const customer = await this.customerController.get({id: session.customer,  fatal: true});
		this.assure(customer, `Can't find customer with ID ${session.customer}`);

		const confirmation = await this.trialconfirmationController.get({id: session.trial_confirmation, fatal: true});
		this.assure(confirmation, `Can't find confirmation with ID ${session.trial_confirmation}`);
		this.assure(confirmation.sms_provider, `Confirmation with ID ${session.trial_confirmation} has no SMS provider.`);

		if (markAsDelivered) {
			await this.trialconfirmationController.markDelivered({confirmation});
		}
		return this.sendDeliveryConfirmationSms(customer.phone, confirmation.code, confirmation.sms_provider);
	}

	async retryNotification(sessionId: string) {
		return this.confirmTrialDelivery(sessionId, false);
	}


	assure(object: any, message: string) {
		if (object) {
			return;
		}

		du.error(message);
		throw eu.getError('bad_request', message);
	}

}
