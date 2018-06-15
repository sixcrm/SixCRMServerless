

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;

const SMTPProvider = global.SixCRM.routes.include('controllers', 'providers/smtp-provider.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

module.exports = class CustomerMailerHelper {

	constructor(){

		this.parameter_definition = {
			instantiate:{
				required:{
					smtpprovider:'smtp_provider'
				},
				optional:{}
			},
			sendEmail:{
				required:{
					sendoptions: 'send_options'
				},
				optional:{}
			}
		};

		this.parameter_validation = {
			'smtpprovider':global.SixCRM.routes.path('model', 'entities/smtpprovider.json'),
			'sendoptions':global.SixCRM.routes.path('model', 'general/smtp_send_object.json'),
			'processedsendoptions':global.SixCRM.routes.path('model', 'general/smtp_send_object.json')
		};

		this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});
		this.parameters.setParameters({argumentation: arguments[0], action: 'instantiate'});

		this.instantiate();

	}

	instantiate(){

		du.debug('Instantiate');

		let instantiation_options = this.createInstantiationOptions();

		this.smtpprovider = new SMTPProvider(instantiation_options);

		return true;

	}

	createInstantiationOptions(){

		du.debug('Create Instantiation Options');

		let smtp_provider = this.parameters.get('smtpprovider');

		let options = objectutilities.transcribe(
			{
				hostname: 'hostname',
				username: 'username',
				password: 'password',
			},
			smtp_provider,
			{},
			true
		);

		options = objectutilities.transcribe(
			{
				port: 'port'
			},
			smtp_provider,
			options,
			false
		);

		return options;

	}

	sendEmail(){

		du.debug('Send Email');

		return Promise.resolve()
			.then(() => this.parameters.setParameters({argumentation: arguments[0], action: 'sendEmail'}))
			.then(() => this.createSendOptions())
			.then(() => this.executeSend());

	}

	createSendOptions(){

		du.debug('Create Send Options');

		let send_email_options = this.parameters.get('sendoptions');

		let options = objectutilities.transcribe(
			{
				sender_email:'sender_email',
				sender_name:'sender_name',
				subject: 'subject',
				body: 'body',
				recepient_emails: 'recepient_emails'
			},
			send_email_options,
			{},
			true
		);

		options = objectutilities.transcribe(
			{
				recepient_name: 'recepient_name'
			},
			send_email_options,
			options,
			false
		);

		this.parameters.set('processedsendoptions', options);

		return true;

	}

	executeSend(){

		du.debug('Execute Send');

		let processed_send_options = this.parameters.get('processedsendoptions');

		return this.smtpprovider.send(processed_send_options);

	}

}
