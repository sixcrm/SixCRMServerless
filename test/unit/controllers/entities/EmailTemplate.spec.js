let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

function getValidEmailTemplate() {
    return {
        "id": "b44ce483-861c-4843-a7d6-b4c649d6bdde",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "name": "Test Email 1",
        "subject":"This is the subject line.",
        "body":"This is the body.",
        "smtp_provider":"18213d0b-cd6d-4cea-91b9-993d7443468b",
        "type":"allorders",
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}
function getValidSMTPProvider() {
    return {
        "id":"18213d0b-cd6d-4cea-91b9-993d7443468b",
        "account":"d3fa3bf3-7824-49f4-8261-87674482bf1c",
        "name":"Test SMTP Provider",
        "hostname":"mail.reefbuzz.com",
        "username":"kris@reefbuzz.com",
        "password":"Kris123!!!",
        "port":465,
        "from_email":"donotreply@sixcrm.com",
        "from_name":"Do Not Reply",
        "created_at":"2017-04-06T18:40:41.405Z",
        "updated_at":"2017-04-06T18:41:12.521Z"
    }
}

describe('controllers/EmailTemplate.js', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    afterEach(() => {
        mockery.resetCache();
        mockery.deregisterAll();
    });

    describe('listBySMTPProvider', () => {

        it('lists email templates by SMTP provider', () => {
            let params = {
                smtpprovider: 'a_smtp_provider',
                pagination: 0
            };

            let emailTemplate = getValidEmailTemplate();

            PermissionTestGenerators.givenUserWithAllowed('read', 'emailtemplate');

            mockery.registerMock(global.SixCRM.routes.path('lib', 'dynamodb-utilities.js'), {
                queryRecords: (table, parameters, index) => {
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

            let emailTemplateController = global.SixCRM.routes.include('controllers','entities/EmailTemplate.js');

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

            let emailTemplateController = global.SixCRM.routes.include('controllers','entities/EmailTemplate.js');

            return emailTemplateController.getSMTPProvider(emailTemplate).then((result) => {
                expect(result).to.deep.equal(null);
            });
        });

        it('retrieves SMTP provider from an email template', () => {

            let emailTemplate = getValidEmailTemplate();

            let smtp_provider = getValidSMTPProvider();

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/SMTPProvider.js'), {
                get: ({id}) => {
                    expect(id).to.equal(emailTemplate.smtp_provider);

                    return Promise.resolve(smtp_provider);
                }
            });

            let emailTemplateController = global.SixCRM.routes.include('controllers','entities/EmailTemplate.js');

            return emailTemplateController.getSMTPProvider(emailTemplate).then((result) => {
                expect(result).to.deep.equal(smtp_provider);
            });
        });
    });
});