let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');
let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');

describe('controllers/SMTPProvider.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	beforeEach(() => {
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

	describe('validateSMTPProvider', () => {

		let default_sender_email = global.SixCRM.configuration.site_config.ses.default_sender_email;

		let default_sender_name = global.SixCRM.configuration.site_config.ses.default_sender_name;

		it('successfully validates SMTP provider', () => {

			let params = {
				email: 'any_email@example.com',
				smtpprovider: {
					id: 'dummy_id'
				}
			};

			let any_smtp_provider = {
				id: params.smtpprovider.id
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'smtpprovider');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('smtpproviders');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(params.smtpprovider.id);
					return Promise.resolve({
						Count: 1,
						Items: [any_smtp_provider]
					});
				}
			});

			let mock_smtp_controller = class {
				constructor(){}

				send({sender_email, sender_name, subject, body, recepient_emails}) {
					expect(sender_email).to.equal(default_sender_email);
					expect(sender_name).to.equal(default_sender_name);
					expect(subject).to.equal("Testing SMTP Provider");
					expect(body).to.contain(params.smtpprovider.id);
					expect(recepient_emails).to.deep.equal([params.email]);
					return Promise.resolve('Successfully sent.')
				}
			};

			mockery.registerMock(global.SixCRM.routes.path('controllers','providers/SMTP.js'), mock_smtp_controller);

			let SMTPProviderController = global.SixCRM.routes.include('controllers','entities/SMTPProvider.js');
			const smtpProviderController = new SMTPProviderController();

			return smtpProviderController.validateSMTPProvider(params).then((result) => {
				expect(result).to.deep.equal({
					send_properties: {
						sender_email: default_sender_email,
						sender_name: default_sender_name,
						subject: "Testing SMTP Provider",
						body: "This is a test of the SMTP provider ID :" + params.smtpprovider.id,
						recepient_emails: [params.email]
					},
					smtp_response:'Successfully sent.',
					smtpprovider: any_smtp_provider
				});
			});
		});

		xit('successfully validates SMTP provider', () => {

			/*
			let params = {
				email: 'any_email@example.com',
				smtpprovider: {
					id: 'dummy_id'
				}
			};

			let any_smtp_provider = {
				id: params.smtpprovider.id
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'smtpprovider');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('smtpproviders');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(params.smtpprovider.id);
					return Promise.resolve({
						Count: 1,
						Items: [any_smtp_provider]
					});
				}
			});

			let mock_smtp_controller = class {
				constructor(){}

				send({sender_email, sender_name, subject, body, recepient_emails}) {
					expect(sender_email).to.equal(default_sender_email);
					expect(sender_name).to.equal(default_sender_name);
					expect(subject).to.equal("Testing SMTP Provider");
					expect(body).to.contain(params.smtpprovider.id);
					expect(recepient_emails).to.deep.equal([params.email]);
					return Promise.resolve('Successfully sent.')
				}
			};*/

			//mockery.registerMock(global.SixCRM.routes.path('controllers','providers/SMTP.js'), mock_smtp_controller);

			let SMTPProviderController = global.SixCRM.routes.include('controllers','entities/SMTPProvider.js');
			const smtpProviderController = new SMTPProviderController();

			const params = {
				email: 'tmdalbey@gmail.com',
				smtpprovider: 'dc5be1db-e84a-4ad3-8724-c543a98d0b4e'
			}

			PermissionTestGenerators.givenUserWithAllowed('*', '*', '*');
			global.account = '*';
			return smtpProviderController.validateSMTPProvider(params).then((result) => {
				expect(result).to.deep.equal({
					send_properties: {
						sender_email: default_sender_email,
						sender_name: default_sender_name,
						subject: "Testing SMTP Provider",
						body: "This is a test of the SMTP provider ID :" + params.smtpprovider.id,
						recepient_emails: [params.email]
					},
					smtp_response:'Successfully sent.',
					smtpprovider: any_smtp_provider
				});
			});
		});

		it('throws error when specified SMTP provider was not found', () => {

			let params = {
				email: 'any_email@example.com',
				smtpprovider: {
					id: 'dummy_id'
				}
			};

			PermissionTestGenerators.givenUserWithAllowed('read', 'smtpprovider');

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/dynamodb-provider.js'), class {
				queryRecords(table, parameters) {
					expect(table).to.equal('smtpproviders');
					expect(parameters.expression_attribute_values[':primary_keyv']).to.equal(params.smtpprovider.id);
					return Promise.resolve({
						Count: 0,
						Items: []
					});
				}
			});

			let SMTPProviderController = global.SixCRM.routes.include('controllers','entities/SMTPProvider.js');
			const smtpProviderController = new SMTPProviderController();

			return smtpProviderController.validateSMTPProvider(params).catch((error) => {
				expect(error.message).to.equal('[500] The SMTP Provider specified was not found.');
			});
		});
	});
});
