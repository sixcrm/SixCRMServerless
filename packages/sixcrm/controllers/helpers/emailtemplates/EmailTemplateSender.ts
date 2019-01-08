require('module-alias/register');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const CustomMailerHelper = require('@root/controllers/helpers/email/CustomerMailer.js');
const handlebars = require('@root/controllers/helpers/emailtemplates/Handlebars.js');
const EmailTemplateController = require('@root/controllers/entities/EmailTemplate.js');
const SMTPPRoviderController = require('@root/controllers/entities/SMTPProvider.js');
const AccountDetailsController = require('@root/controllers/entities/AccountDetails.js');

declare const global: any;

export default class EmailTemplateSender {
	private emailTemplatesController: any = new EmailTemplateController();
	private accountDetailsController: any = new AccountDetailsController();
	private smtpProviderController: any = new SMTPPRoviderController();

	constructor() {
		this.emailTemplatesController.sanitize(false);
		this.smtpProviderController.sanitize(false);
	}

	async sendEmailWithTemplate(parameters: {template_id: string}) {

		du.debug('EmailTemplateSender.sendEmailWithTemplate()', parameters.template_id);


		let template = await this.emailTemplatesController.get({id: parameters.template_id});
		let smtp_provider = await this.smtpProviderController.get({id: template.smtp_provider});

		let compiled_body = await this.compileBodyWithExampleData({template});

		let options = {
			sender_email: smtp_provider.from_email,
			sender_name: smtp_provider.from_name,
			subject: template.subject,
			body: compiled_body,
			recepient_emails:[global.user.id],
			recepient_name: global.user.id
		};
		du.debug(options);

		const customerEmailer = new CustomMailerHelper({smtp_provider: smtp_provider});
		return customerEmailer.sendEmail({send_options: options});
	}


	compileBody(template_body: string, context: any): string {
		let compiled_template = handlebars.compile(template_body);
		let compiled_body = compiled_template(context);

		return compiled_body;
	}

	compileBodyWithExampleData(parameters: {template: any}) {
		du.debug('Compile Body With Example', parameters.template);

		let context = require('@root/controllers/helpers/emailtemplates/example_context');

		return this.accountDetailsController.get({ id: global.account }).then((account_details: any) => {
			context.accountdetails = account_details;

			return this.compileBody(parameters.template.body, context);
		});

	}
};
