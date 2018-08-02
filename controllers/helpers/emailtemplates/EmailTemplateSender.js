const _ = require('lodash');

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;

const CustomerMailerHelper = global.SixCRM.routes.include('helpers', 'email/CustomerMailer.js');
const EmailTemplateController = global.SixCRM.routes.include('entities', 'EmailTemplate.js');
const SMTPPRoviderController = global.SixCRM.routes.include('entities', 'SMTPProvider.js');

module.exports = class EmailTemplateSender {

	constructor() {
		this.emailTemplatesController = new EmailTemplateController();
		this.smtpPRoviderController = new SMTPPRoviderController();
		this.emailTemplatesController.sanitize(false);
		this.smtpPRoviderController.sanitize(false);
	}

	async sendEmailWithTemplate({template_id}) {

		du.debug('EmailTemplateSender.sendEmailWithTemplate()', template_id);


		let template = await this.emailTemplatesController.get({id: template_id});
		let smtp_provider = await this.smtpPRoviderController.get({id: template.smtp_provider});

		let context = {
			customer: {
				firstname: "John",
				lastname: "Doe"
			}
		};

		let body = this.compileBody(template.body, context);

		let options = {
			sender_email: smtp_provider.from_email,
			sender_name: smtp_provider.from_name,
			subject: template.subject,
			body: body,
			recepient_emails:[global.user.id],
			recepient_name: global.user.id
		};
		du.debug(options);

		const customerEmailer = new CustomerMailerHelper({smtp_provider: smtp_provider});
		return customerEmailer.sendEmail({send_options: options});
	}

	compileBody(body, context) {
		let matches = body.match(/{{.+?}}/g) || [];
		let result = body;

		let strip = function (match) {
			return match.replace('{{', '').replace('}}', '');
		};

		matches.forEach((match) => {
			result = result.replace(new RegExp(match,'g'), _(context).at(strip(match)));
		});

		return result;
	}

}
