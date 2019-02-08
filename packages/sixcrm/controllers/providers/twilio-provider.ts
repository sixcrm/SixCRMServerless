require('module-alias/register');

const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;

export default class TwilioProvider {

	async sendSMS(text: string, phoneNumber: string) {

		du.info(`Sending SMS to ${phoneNumber}`);

		const accountSid = 'AC895a65b65e4820ee38aff9e91ffe278f';
		const authToken = '7baa8504b0d563e8dda709958976a5a9';
		const client = require('twilio')(accountSid, authToken);

		return client.messages
			.create({
				body: text,
				from: '+14245432319',
				to: phoneNumber
			})
	}
}
