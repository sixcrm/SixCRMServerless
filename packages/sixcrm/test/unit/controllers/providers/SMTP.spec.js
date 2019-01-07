let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('controllers/providers/SMTP.js', () => {

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

	after(() => {
		mockery.disable();
	});

	describe('constructor', () => {

		it('successfully sets required and optional options', () => {

			let smtp_provider = {
				hostname: 'hostname.example',
				username: 'testusername@example.com',
				password: 'a_password',
				port: 123
			};

			let SmtpController = global.SixCRM.routes.include('controllers', 'providers/SMTP.js');
			let smtpController = new SmtpController(smtp_provider);

			expect(smtpController.hostname).to.equal(smtp_provider.hostname);
			expect(smtpController.username).to.equal(smtp_provider.username);
			expect(smtpController.password).to.equal(smtp_provider.password);
			expect(smtpController.port).to.equal(smtp_provider.port);
		});

		it('successfully sets required options', () => {

			let smtp_provider = {
				hostname: 'hostname.example',
				username: 'testusername@example.com',
				password: 'a_password'
			};

			let SmtpController = global.SixCRM.routes.include('controllers', 'providers/SMTP.js');
			let smtpController = new SmtpController(smtp_provider);

			expect(smtpController.hostname).to.equal(smtp_provider.hostname);
			expect(smtpController.username).to.equal(smtp_provider.username);
			expect(smtpController.password).to.equal(smtp_provider.password);
			expect(smtpController.port).to.be.undefined;
		});

		it('throws error when required options are omitted', () => {

			let smtp_provider = {
				port: 123
			};

			let SmtpController = global.SixCRM.routes.include('controllers', 'providers/SMTP.js');

			try{
				new SmtpController(smtp_provider);
			}catch (error){
				expect(error.message).to.equal('[500] SMTP Object requires "hostname" option.');
			}
		});
	});

	describe('send', () => {

		it('successfully sends', () => {

			let any_send_object = {
				any_data: 'any_data'
			};

			let smtp_provider = {
				hostname: 'hostname.example',
				username: 'testusername@example.com',
				password: 'a_password',
				port: 123
			};

			let SmtpController = global.SixCRM.routes.include('controllers', 'providers/SMTP.js');
			let smtpController = new SmtpController(smtp_provider);

			smtpController.connection.send = (send_object) => {
				expect(send_object).to.equal(any_send_object);
				return Promise.resolve('Successfully sent.');
			};

			return smtpController.send(any_send_object).then((result) => {
				expect(result).to.equal('Successfully sent.');
			});
		});

		it('throws error when sending failed', () => {

			let any_send_object = {
				any_data: 'any_data'
			};

			let smtp_provider = {
				hostname: 'hostname.example',
				username: 'testusername@example.com',
				password: 'a_password',
				port: 123
			};

			let SmtpController = global.SixCRM.routes.include('controllers', 'providers/SMTP.js');
			let smtpController = new SmtpController(smtp_provider);

			smtpController.connection.send = (send_object) => {
				expect(send_object).to.equal(any_send_object);
				return Promise.reject(new Error('Sending failed.'));
			};

			return smtpController.send(any_send_object).catch((error) => {
				expect(error.message).to.equal('Sending failed.');
			});
		});
	})
});
