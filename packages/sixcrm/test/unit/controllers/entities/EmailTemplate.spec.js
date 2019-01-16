let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
const MockEntities = global.SixCRM.routes.include('test', 'mock-entities.js');

function getValidEmailTemplate() {
	return MockEntities.getValidEmailTemplate()
}
function getValidSMTPProvider() {
	return MockEntities.getValidSMTPProvider()
}

describe('controllers/EmailTemplate.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {});

		mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/sqs-provider.js'), class {
			sendMessage() {
				return Promise.resolve(true);
			}
		});
	});

	afterEach(() => {
		mockery.resetCache();
		mockery.deregisterAll();
	});

	after(() => {
		mockery.disable();
	});

	describe('listBySMTPProvider', () => {

		it('lists email templates by SMTP provider', () => {
			let params = {
				smtpprovider: 'a_smtp_provider',
				pagination: 0
			};

			let emailTemplate = getValidEmailTemplate();

			PermissionTestGenerators.givenUserWithAllowed('read', 'emailtemplate');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters, index) {
					expect(table).to.equal('emailtemplates');
					expect(parameters).to.have.property('filter_expression');
					expect(parameters).to.have.property('expression_attribute_values');
					expect(parameters).to.have.property('expression_attribute_names');
					expect(index).to.equal('account-index');
					return Promise.resolve({
						Count: 1,
						Items: [emailTemplate]
					});
				}
			});

			let EmailTemplateController = global.SixCRM.routes.include('controllers','entities/EmailTemplate.js');
			const emailTemplateController = new EmailTemplateController();

			return emailTemplateController.listBySMTPProvider(params).then((result) => {
				expect(result).to.deep.equal({
					pagination: {
						count: 1,
						end_cursor: '',
						has_next_page: 'false',
						last_evaluated: ""
					},
					emailtemplates: [emailTemplate]
				});
			});
		});
	});

	describe('getSMTPProvider', () => {

		it('returns null when email template does not have a SMTP provider', () => {

			let emailTemplate = getValidEmailTemplate();

			delete emailTemplate.smtp_provider;

			let EmailTemplateController = global.SixCRM.routes.include('controllers','entities/EmailTemplate.js');
			const emailTemplateController = new EmailTemplateController();

			return emailTemplateController.getSMTPProvider(emailTemplate).then((result) => {
				expect(result).to.deep.equal(null);
			});
		});

		it('retrieves SMTP provider from an email template', () => {

			let emailTemplate = getValidEmailTemplate();

			let smtp_provider = getValidSMTPProvider();

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/SMTPProvider.js'), class {
				get({id}) {
					expect(id).to.equal(emailTemplate.smtp_provider);

					return Promise.resolve(smtp_provider);
				}
			});

			let EmailTemplateController = global.SixCRM.routes.include('controllers','entities/EmailTemplate.js');
			const emailTemplateController = new EmailTemplateController();

			return emailTemplateController.getSMTPProvider(emailTemplate).then((result) => {
				expect(result).to.deep.equal(smtp_provider);
			});
		});
	});
});
