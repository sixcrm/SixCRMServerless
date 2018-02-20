'use strict'

const mockery = require('mockery');
let chai = require('chai');

let expect = chai.expect;
let objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

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

        smtp_provider.hostname = 'email-smtp.us-east-1.amazonaws.com';
        smtp_provider.username = 'AKIAJ5M2M5XJH7SX7PPA';
        smtp_provider.password = 'AppgYu3q95vP/X7C1AISfqMNmQ7fxAS6mXlYt9p7dvE5';
        delete smtp_provider.port;


        let email_options = {
          sender_email:'system@sixcrm.com',
          sender_name: 'SixCRM.com',
          subject: 'Unit Test Email',
          body: 'This is a unit test sending you a email.',
          recepient_emails: ['tmdalbey@gmail.com'],
          recepient_name: 'Timothy Dalbey'
        }

        const CustomerMailerHelperController = global.SixCRM.routes.include('helpers', 'email/CustomerMailer.js');
        let customerMailerHelperController = new CustomerMailerHelperController({smtp_provider: smtp_provider});

        return customerMailerHelperController.sendEmail({send_options: email_options});

      });

    });

});
