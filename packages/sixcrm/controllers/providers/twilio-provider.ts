require('module-alias/register');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;

interface SMSResponse {
	message: any,
	success: boolean
}

export default class TwilioProvider {

	private readonly api_account: string;
	private readonly api_token: string;
	private readonly from_number: string;

	constructor(configuration: any) {
		this.api_account = configuration.api_account;
		this.api_token = configuration.api_token;
		this.from_number = configuration.from_number
	}

	// https://www.twilio.com/docs/sms/send-messages
	async sendSMS(text: string, phoneNumber: string): Promise<SMSResponse> {

		du.info(`Sending SMS to ${phoneNumber}`);

		const client = require('twilio')(this.api_account, this.api_token);

		try {
			const twilioResponse = await client.messages
				.create({
					body: text,
					from: this.from_number,
					to: phoneNumber
				});

			if (!twilioResponse.error_code) {
				return TwilioProvider.respond(twilioResponse);
			}

			du.error(`Twilio response error code ${twilioResponse.error_code}`);
			du.error(`Twilio response error message ${twilioResponse.error_message}`);

			return TwilioProvider.respond(twilioResponse.error_message, false);

		} catch (error) {
			return TwilioProvider.respond(error, false)
		}

	}

	private static respond(message: any, success: boolean = true): SMSResponse {
		const level = success ? 'debug' : 'info';
		du[level](`Twilio response success: ${success}, message: '${message}'`);

		return { message, success }
	}


}
