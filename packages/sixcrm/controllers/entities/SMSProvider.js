require('module-alias/register');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const TwilioProvider = require('@lib/controllers/providers/twilio-provider.js').default;

const providerMapping = {
	'twilio': TwilioProvider
};

module.exports = class SMTPProviderController extends entityController {

	constructor(){
		super('smsprovider');
	}

	async validate({recipient_phone, smtpprovider_id}) {
		const configuration = await this.get({id: smtpprovider_id});

		if(!configuration) {
			throw eu.getError('notfound', 	`Can't find sms provider with ID ${smtpprovider_id}`);
		}

		const implementation = providerMapping[configuration.type];
		if (!implementation) {
			throw eu.getError('notfound', `No implementation for SMS provider type ${configuration.type}`);
		}

		const provider = new implementation(configuration);

		return provider.sendSMS('This is a test message sent via SixCRM', recipient_phone);
	}

};
