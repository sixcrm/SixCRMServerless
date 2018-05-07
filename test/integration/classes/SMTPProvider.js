
const uuidV4 = require('uuid/v4');

const du = global.SixCRM.routes.include('lib','debug-utilities.js');

const IntegrationTest = global.SixCRM.routes.include('test', 'integration/classes/IntegrationTest');

module.exports = class SMTPProviderTest extends IntegrationTest {

	constructor(){

		super();

	}

	executeEmailTemplateBlockTest(){

		du.info('Execute Email Template Block Test');

		let smtpprovider_id = uuidV4();
		let emailtemplate_id = uuidV4();

		du.info('SMTP Provider ID: '+smtpprovider_id);
		du.info('Email Template ID: '+emailtemplate_id);

		return this.createSMTPProvider(smtpprovider_id)
			.then(() => this.createEmailTemplate(emailtemplate_id, smtpprovider_id))
			.then(() => this.deleteSMTPProvider(smtpprovider_id, 403))
			.then(response => {
				return response;
			})
			.then(() => this.deleteEmailTemplate(emailtemplate_id))
			.then(() => this.deleteSMTPProvider(smtpprovider_id));

	}

	createSMTPProvider(smtpprovider_id){

		du.info('Create SMTP Provider');

		let smtpprovider_create_query = `mutation { createsmtpprovider (smtpprovider: { id: "`+smtpprovider_id+`", name: "test", hostname: "123.123.123.123", username: "test", password: "test", from_email:"test@test.com", from_name:"Test", port: 25}) { id } }`;

		return this.executeQuery(smtpprovider_create_query);

	}

	createEmailTemplate(emailtemplate_id, smtpprovider_id){

		du.info('Create Email Template');

		let emailtemplate_create_query = `mutation { createemailtemplate (emailtemplate: { id: "`+emailtemplate_id+`", name: "test", subject: "test", body: "test", type: "initialfulfillment", smtp_provider:"`+smtpprovider_id+`"}) { id } }`;

		return this.executeQuery(emailtemplate_create_query);

	}

	deleteSMTPProvider(id, code){

		du.info('Delete SMTP Provider');

		let delete_query = `mutation { deletesmtpprovider (id: "`+id+`") { id } }`;

		return this.executeQuery(delete_query, code);

	}

	deleteEmailTemplate(id, code){

		du.info('Delete Email Template');

		let delete_query = `mutation { deleteemailtemplate (id: "`+id+`" ) { id } }`;

		return this.executeQuery(delete_query, code);

	}

}
