require('module-alias/register');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const du = require('@6crm/sixcrmcore/lib/util/debug-utilities').default;
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const TwilioProvider = require('@lib/controllers/providers/twilio-provider.js').default;

const providerMapping = {
	'twilio': TwilioProvider
};

module.exports = class SMTPProviderController extends entityController {

	constructor(){
		super('smsprovider');
	}

	async sendSMS(provider_id, recipient_phone, message) {
		const provider = await this.getImplementation(provider_id).sendSMS();

		return provider.sendSMS(message, recipient_phone);
	}

	async validateSMSProvider({recipient_phone, smsprovider_id}) {
		du.debug('Validate SMS provider', recipient_phone, smsprovider_id);

		const provider = await this.getImplementation(smsprovider_id);

		return provider.sendSMS('This is a test message sent via SixCRM', recipient_phone);
	}

	async getImplementation(provider_id) {
		du.debug('Get SMS provider implementation', provider_id);

		const configuration = await this.get({id: provider_id});

		if(!configuration) {
			du.error(`Can't find sms provider with ID ${provider_id}`);
			throw eu.getError('notfound', 	`Can't find sms provider with ID ${provider_id}`);
		}

		const implementation = providerMapping[configuration.type];
		if (!implementation) {
			du.error(`No implementation for SMS provider type ${configuration.type}`);
			throw eu.getError('notfound', `No implementation for SMS provider type ${configuration.type}`);
		}

		return new implementation(configuration);
	}
};
