

const mockery = require('mockery');
let chai = require('chai');

let expect = chai.expect;
let objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

describe('helpers/transaction/CustomerMailer.spec.js', () => {

	before(() => {
		mockery.enable({
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		});
	});

	afterEach(() => {
		mockery.resetCache();
	});

	after(() => {
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('constructor', () => {

		it('instantiates the Customer Mailer', () => {

			let smtp_provider = MockEntities.getValidSMTPProvider();

			const CustomerMailerHelperController = global.SixCRM.routes.include('helpers', 'email/CustomerMailer.js');
			let customerMailerHelperController = new CustomerMailerHelperController({smtp_provider: smtp_provider});

			expect(objectutilities.getClassName(customerMailerHelperController)).to.equal('CustomerMailerHelper');

		});

	});

	describe('sendEmail', () => {

		it('successfully sends a email', () => {

			let smtp_provider = MockEntities.getValidSMTPProvider();

			let email_options = {
				sender_email:'system@sixcrm.com',
				sender_name: 'SixCRM.com',
				subject: 'Unit Test Email',
				body: 'This is a unit test sending you a email.',
				recepient_emails: ['tmdalbey@gmail.com'],
				recepient_name: 'Timothy Dalbey'
			}

			mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/smtp-provider.js'), class {
				constructor(){}
				send(){
					return Promise.resolve('some-long-string-or-something');
				}
			});

			const CustomerMailerHelperController = global.SixCRM.routes.include('helpers', 'email/CustomerMailer.js');
			let customerMailerHelperController = new CustomerMailerHelperController({smtp_provider: smtp_provider});

			return customerMailerHelperController.sendEmail({send_options: email_options});

		});

	});

});
