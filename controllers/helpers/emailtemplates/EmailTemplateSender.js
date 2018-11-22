"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
// const CustomerMailerHelper = global.SixCRM.routes.include('helpers', 'email/CustomerMailer.js');
// const EmailTemplateController = global.SixCRM.routes.include('entities', 'EmailTemplate.js');
// const SMTPPRoviderController = global.SixCRM.routes.include('entities', 'SMTPProvider.js');
// const handlebars = global.SixCRM.routes.include('helpers', 'emailtemplates/Handlebars.js');
// const AccountDetailsController = global.SixCRM.routes.include('entities', 'AccountDetails.js');
const CustomMailerHelper = require('../email/CustomerMailer.js');
const handlebars = require('./Handlebars.js');
const EmailTemplateController = require('../../entities/EmailTemplate.js');
const SMTPPRoviderController = require('../../entities/SMTPProvider.js');
const AccountDetailsController = require('../../entities/AccountDetails.js');
class EmailTemplateSender {
    constructor() {
        this.emailTemplatesController = new EmailTemplateController();
        this.accountDetailsController = new AccountDetailsController();
        this.smtpProviderController = new SMTPPRoviderController();
        this.emailTemplatesController.sanitize(false);
        this.smtpProviderController.sanitize(false);
    }
    sendEmailWithTemplate(parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            du.debug('EmailTemplateSender.sendEmailWithTemplate()', parameters.template_id);
            let template = yield this.emailTemplatesController.get({ id: parameters.template_id });
            let smtp_provider = yield this.smtpProviderController.get({ id: template.smtp_provider });
            let compiled_body = yield this.compileBodyWithExampleData({ template });
            let options = {
                sender_email: smtp_provider.from_email,
                sender_name: smtp_provider.from_name,
                subject: template.subject,
                body: compiled_body,
                recepient_emails: [global.user.id],
                recepient_name: global.user.id
            };
            du.debug(options);
            const customerEmailer = new CustomMailerHelper({ smtp_provider: smtp_provider });
            return customerEmailer.sendEmail({ send_options: options });
        });
    }
    compileBody(template_body, context) {
        let compiled_template = handlebars.compile(template_body);
        let compiled_body = compiled_template(context);
        return compiled_body;
    }
    compileBodyWithExampleData(parameters) {
        du.debug('Compile Body With Example', parameters.template);
        let context = require('./example_context');
        return this.accountDetailsController.get({ id: global.account }).then((account_details) => {
            context.accountdetails = account_details;
            return this.compileBody(parameters.template.body, context);
        });
    }
}
exports.EmailTemplateSender = EmailTemplateSender;
;
//# sourceMappingURL=EmailTemplateSender.js.map