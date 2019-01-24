
const _ = require('lodash');
const eu = require('@6crm/sixcrmcore/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class SMTPProviderController extends entityController {

	constructor(){

		super('smtpprovider');

		this.search_fields = ['name'];

		this.encrypted_attribute_paths = [
			'username',
			'password'
		];

	}

	associatedEntitiesCheck({id}){
		let return_array = [];

		let data_acquisition_promises = [
			this.executeAssociatedEntityFunction('EmailTemplateController', 'listBySMTPProvider', {smtpprovider:id})
		];

		return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

			let emailtemplates = data_acquisition_promises[0];

			if(_.has(emailtemplates, 'emailtemplates') && arrayutilities.nonEmpty(emailtemplates.emailtemplates)){
				arrayutilities.map(emailtemplates.emailtemplates, (emailtemplate) => {
					return_array.push(this.createAssociatedEntitiesObject({name:'Email Template', object: emailtemplate}));
				});
			}

			return return_array;

		});

	}

	validateSMTPProvider({email, smtpprovider}){
		this.sanitize(false);
		return this.get({id: smtpprovider}).then(smtpprovider => {
			this.sanitize(true);

			if(_.isNull(smtpprovider)){
				throw eu.getError('notfound', 'The SMTP Provider specified was not found.');
			}

			const SMTPProviderProvider = global.SixCRM.routes.include('providers', 'SMTP.js');
			let smtp = new SMTPProviderProvider(smtpprovider);

			let send_object = {
				sender_email: (_.has(smtpprovider, 'from_email'))?smtpprovider.from_email:global.SixCRM.configuration.site_config.ses.default_sender_email,
				sender_name: (_.has(smtpprovider, 'from_name'))?smtpprovider.from_name:global.SixCRM.configuration.site_config.ses.default_sender_name,
				subject:"Testing SMTP Provider",
				body:  "This is a test of the SMTP provider ID :"+smtpprovider.id,
				recepient_emails:[email]
			};

			return smtp.send(send_object).then(smtp_response => {

				return {
					send_properties: send_object,
					smtp_response:smtp_response,
					smtpprovider: smtpprovider
				};

			}).catch(error => {

				return {
					send_properties: send_object,
					smtp_response: {errormessage: error.message, error: error},
					smtpprovider: smtpprovider
				};

			});

		});

	}

	async update({entity}) {
		await this.handleCensoredValues(entity);

		return super.update({entity, ignore_updated_at: true});
	}


}
