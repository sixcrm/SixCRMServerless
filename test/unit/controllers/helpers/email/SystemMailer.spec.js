'use strict'

const mockery = require('mockery');
let chai = require('chai');

let expect = chai.expect;
let du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
let arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

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

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      expect(objectutilities.getClassName(systemmailer)).to.equal('SystemMailer');

    });

    it('fails validation test email due to missing recipient emails', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      delete parameters.recipient_emails;

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

    });

    it('fails validation test email due to missing recipient name', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      delete parameters.recipient_name;

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

    });

    it('fails validation test email due to recipient email formatting', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      parameters.recipient_name = {};

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters.recipient_name = [];

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters.recipient_name = ['Blerf'];

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters.recipient_name = '';

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters.recipient_name = 'x';

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

    });

    it('fails validation test email due to recipient email formatting', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      parameters.recipient_emails = {};

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.recipient_emails = [];

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.recipient_emails = 'email@email.com';

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.recipient_emails = [''];

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.recipient_emails = ['sdqdwqwdqowdoqwidoqa'];

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.recipient_emails = ['test@test'];

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.recipient_emails = ['test@test.com','adwwadawdad'];

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

    });

    it('fails validation test email due to missing recipient emails', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      delete parameters.recipient_name;

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

    });

    it('fails validation test email due to body formatting', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      parameters.body = [];

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.body = {};

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.body = 123;

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.body = 'a';

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

    });

    it('fails validation test email due to missing body', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      delete parameters.body;

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

    });

    it('fails validation test email due to subject formatting', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      parameters.subject = [];

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.subject = {};

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.subject = 123;

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

      parameters = createValidEmailParameters();

      parameters.subject = 'a';

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

    });

    it('fails validation test email due to missing subject', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      delete parameters.subject;

      try{

        systemmailer.sendEmail(parameters);

      }catch(error){

        expect(error.message).to.have.string('[500] One or more validation errors occurred:');

      }

    });

    it('adds default field (sender_name) to email parameters', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      delete parameters.sender_name;

      parameters = systemmailer.assureOptionalParameters(parameters);

      expect(parameters).to.have.property('sender_name');

      expect(parameters.sender_name).to.equal(global.SixCRM.configuration.site_config.ses.default_sender_name);

    });

    it('adds default field (sender_name) to email parameters', () => {

      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      delete parameters.sender_email;

      parameters = systemmailer.assureOptionalParameters(parameters);

      expect(parameters).to.have.property('sender_email');

      expect(parameters.sender_email).to.equal(global.SixCRM.configuration.site_config.ses.default_sender_email);

    });

    //Technical Debt:  It sends an email

    /*
    it('sends an email', () => {

      mockery.registerMock(global.SixCRM.routes.path('lib', 'smtp-utilities.js'), {
        send: (parameters) => {
          return Promise.resolve(true);
        },
        constructor: (options) => {}
      });


      const systemmailer = global.SixCRM.routes.include('helpers', 'email/SystemMailer.js');

      let parameters = createValidEmailParameters();

      return systemmailer.send(parameters).then(response => {

        du.warning(response);

        expect(response).to.equal(true);

      });

    });
    */

});
