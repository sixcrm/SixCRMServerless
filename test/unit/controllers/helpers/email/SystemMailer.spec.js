

const mockery = require('mockery');
let chai = require('chai');
let expect = chai.expect;
let objectutilities = require('@6crm/sixcrmcore/util/object-utilities').default;

function createValidEmailParameters(){

	return {
		sender_email:'test@sixcrm.com',
		sender_name:'Test Email at SixCRM',
		subject:'This is a test email',
		body:'This email was sent as a part of a SixCRM unit test.',
		recipient_emails:['test2@sixcrm.com'],
		recipient_name:'Test Email 2 at SixCRM'
	};

}

describe('helpers/transaction/SystemMailer.spec.js', () => {

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
	});

	it('instantiates the System Mailer', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		expect(objectutilities.getClassName(systemMailer)).to.equal('SystemMailer');

	});

	it('fails validation test email due to missing recipient emails', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		delete parameters.recipient_emails;

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

	});

	it('fails validation test email due to missing recipient name', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		delete parameters.recipient_name;

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

	});

	it('fails validation test email due to recipient email formatting', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		parameters.recipient_name = {};

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters.recipient_name = [];

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters.recipient_name = ['Blerf'];

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters.recipient_name = '';

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters.recipient_name = 'x';

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

	});

	it('fails validation test email due to recipient email formatting', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		parameters.recipient_emails = {};

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.recipient_emails = [];

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.recipient_emails = 'email@email.com';

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.recipient_emails = [''];

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.recipient_emails = ['sdqdwqwdqowdoqwidoqa'];

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.recipient_emails = ['test@test'];

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.recipient_emails = ['test@test.com','adwwadawdad'];

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

	});

	it('fails validation test email due to missing recipient emails', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		delete parameters.recipient_name;

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

	});

	it('fails validation test email due to body formatting', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		parameters.body = [];

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.body = {};

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.body = 123;

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.body = 'a';

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

	});

	it('fails validation test email due to missing body', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		delete parameters.body;

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

	});

	it('fails validation test email due to subject formatting', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		parameters.subject = [];

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.subject = {};

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.subject = 123;

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

		parameters = createValidEmailParameters();

		parameters.subject = 'a';

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

	});

	it('fails validation test email due to missing subject', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		delete parameters.subject;

		try{

			systemMailer.sendEmail(parameters);

		}catch(error){

			expect(error.message).to.have.string('[500] One or more validation errors occurred:');

		}

	});

	it('adds default field (sender_name) to email parameters', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		delete parameters.sender_name;

		parameters = systemMailer.assureOptionalParameters(parameters);

		expect(parameters).to.have.property('sender_name');

		expect(parameters.sender_name).to.equal(global.SixCRM.configuration.site_config.ses.default_sender_name);

	});

	it('adds default field (sender_name) to email parameters', () => {

		const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
		const systemMailer = new SystemMailer();

		let parameters = createValidEmailParameters();

		delete parameters.sender_email;

		parameters = systemMailer.assureOptionalParameters(parameters);

		expect(parameters).to.have.property('sender_email');

		expect(parameters.sender_email).to.equal(global.SixCRM.configuration.site_config.ses.default_sender_email);

	});

	//Technical Debt:  It sends an email

	/*
    it('sends an email', () => {

      mockery.registerMock(global.SixCRM.routes.path('controllers', 'providers/smtp-provider.js'), class {
        send(parameters) {
          return Promise.resolve(true);
        }
        constructor(options) {}
      });


      const SystemMailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');
      const systemMailer = new SystemMailer();

      let parameters = createValidEmailParameters();

      return systemMailer.send(parameters).then(response => {

        du.warning(response);

        expect(response).to.equal(true);

      });

    });
    */

});
