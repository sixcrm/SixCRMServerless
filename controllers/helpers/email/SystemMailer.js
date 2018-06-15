
const _ = require('lodash');

const du = require('@sixcrm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@sixcrm/sixcrmcore/util/array-utilities').default;
const objectutilities = require('@sixcrm/sixcrmcore/util/object-utilities').default;
const SMTPProvider = global.SixCRM.routes.include('controllers', 'providers/smtp-provider.js');

//Technical Debt:  Validate, write tests.
//Technical Debt:  Integrate

module.exports = class SystemMailer{

	constructor(){

		this.instantiateSMTPProvider();

	}

	sendEmail(parameters){

		du.debug('Send Email');

		parameters = this.assureOptionalParameters(parameters);

		this.validateParameters(parameters);

		return this.send(parameters).then(response => {
			if(_.has(response, 'messageId')){
				return true;
			}
			return false;
		});

	}

	validateParameters(parameters){

		du.debug('Validate Parameters');

		return global.SixCRM.validate(parameters, global.SixCRM.routes.path('model', 'general/smtp_send_object.json'));

	}

	assureOptionalParameters(parameters){

		du.debug('Assure Optional Parameters');

		arrayutilities.map(['sender_email', 'sender_name'], (optional_parameter) => {
			if(!_.has(parameters, optional_parameter)){
				if(objectutilities.hasRecursive(global, 'SixCRM.configuration.site_config.ses.default_'+optional_parameter)){
					parameters[optional_parameter] = global.SixCRM.configuration.site_config.ses['default_'+optional_parameter];
				}
			}
		});

		return parameters;

	}

	send(parameters){

		du.debug('Send');

		this.instantiateSMTPProvider();

		return this.smtpprovider.send(parameters);

	}

	instantiateSMTPProvider(){

		du.debug('Instantiate SMTP Utilities');

		if(!_.has(this, 'smtpprovider')){

			let smtp_options = this.createSMTPOptions();

			this.smtpprovider = new SMTPProvider(smtp_options);

		}

	}

	createSMTPOptions(){

		du.debug('Create SMTP Options');

		return {
			hostname: global.SixCRM.configuration.site_config.ses.hostname,
			username: global.SixCRM.configuration.site_config.ses.smtp_username,
			password: global.SixCRM.configuration.site_config.ses.smtp_password,
			port: global.SixCRM.configuration.site_config.ses.port
		};

	}

}
