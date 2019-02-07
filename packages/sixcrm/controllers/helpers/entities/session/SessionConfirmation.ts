require('module-alias/register');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

const SessionController = require('@root/controllers/entities/Session.js');
const CustomerController = require('@root/controllers/entities/Customer.js');
const SNSProvider = require('@root/controllers/providers/sns-provider.js');

export default class SessionConfirmation {

	private readonly sessionController = new SessionController();
	private readonly customerController = new CustomerController();
	private readonly snsProvider = new SNSProvider();

	async sendDeliveryConfirmationSms(sessionId: string) {

		const session = await this.sessionController.get({id: sessionId});

		if (!session) {
		  du.error(`Unable to acquire a session with id ${sessionId}`);
		  throw eu.getError('bad_request', `Unable to acquire a session with id ${sessionId}`);
		}

		const customer = await this.customerController.get({id: session.customer});

		if (!customer.phone) {
		    du.error(`Customer with id ${customer.id} has no phone number`);
			throw eu.getError('bad_request', `Customer with id ${customer.id} has no phone number`);
		}

		const message = `Please confirm package delivery at https://development-admin.sixcrm.com/confirm/${session.alias}`;

		return this.snsProvider.sendSMS(message, customer.phone);
	}



}
