require('module-alias/register');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

export default class TwilioProvider {

	private readonly api_account: string;
	private readonly api_token: string;
	private readonly from_number: string;

	constructor(configuration: any) {
		this.api_account = configuration.api_account;
		this.api_token = configuration.api_token;
		this.from_number = configuration.from_number
	}

	async sendSMS(text: string, phoneNumber: string) {

		du.info(`Sending SMS to ${phoneNumber}`);

		const client = require('twilio')(this.api_account, this.api_token);

		return client.messages
			.create({
				body: text,
				from: this.from_number,
				to: phoneNumber
			})
	}


}
