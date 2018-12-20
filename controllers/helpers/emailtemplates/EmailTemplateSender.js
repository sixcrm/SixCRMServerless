const CustomerMailerHelper = global.SixCRM.routes.include('helpers', 'email/CustomerMailer.js');
const EmailTemplateController = global.SixCRM.routes.include('entities', 'EmailTemplate.js');
const SMTPPRoviderController = global.SixCRM.routes.include('entities', 'SMTPProvider.js');
const handlebars = global.SixCRM.routes.include('helpers', 'emailtemplates/Handlebars.js');
const AccountDetailsController = global.SixCRM.routes.include('entities', 'AccountDetails.js');


module.exports = class EmailTemplateSender {

	constructor() {
		this.emailTemplatesController = new EmailTemplateController();
		this.smtpPRoviderController = new SMTPPRoviderController();
		this.accountDetailsController = new AccountDetailsController();
		this.emailTemplatesController.sanitize(false);
		this.smtpPRoviderController.sanitize(false);
	}

	async sendEmailWithTemplate({template_id}) {
		let template = await this.emailTemplatesController.get({id: template_id});
		let smtp_provider = await this.smtpPRoviderController.get({id: template.smtp_provider});

		let compiled_body = await this.compileBodyWithExampleData({template});

		let options = {
			sender_email: smtp_provider.from_email,
			sender_name: smtp_provider.from_name,
			subject: template.subject,
			body: compiled_body,
			recepient_emails:[global.user.id],
			recepient_name: global.user.id
		};

		const customerEmailer = new CustomerMailerHelper({smtp_provider: smtp_provider});
		return customerEmailer.sendEmail({send_options: options});
	}


	compileBody(template_body, context) {
		let compiled_template = handlebars.compile(template_body);
		let compiled_body = compiled_template(context);

		return compiled_body;
	}

	compileBodyWithExampleData({template}) {
		let context = require('./example_context');

		return this.accountDetailsController.get({ id: global.account }).then((account_details) => {
			context.accountdetails = account_details;

			return this.compileBody(template.body, context);
		});

	}
};
