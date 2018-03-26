'use strict'

const chai = require("chai");
const expect = chai.expect;
const mockery = require('mockery');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const MockEntities = global.SixCRM.routes.include('test','mock-entities.js');

describe('controllers/workers/eventEmails', () => {

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    mockery.resetCache();
    mockery.deregisterAll();
  });

  beforeEach(() => {
    //global.SixCRM.localcache.clear('all');
  });

  afterEach(() => {
      mockery.resetCache();
      mockery.deregisterAll();
  });

  describe('constructor', () => {

    it('instantiates the eventEmailsController class', () => {

      let eventEmailsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/eventEmails.js');

      expect(objectutilities.getClassName(eventEmailsController)).to.equal('EventEmailsController');

    });

  });

  describe('execute', () => {

    xit('successfully executes (live)', () => {

      let customer = MockEntities.getValidCustomer();

      customer.email = 'tmdalbey+2@gmail.com';
      customer.firstname = 'Timothy';
      customer.lastname = 'Dalbey';

      let campaign = MockEntities.getValidCampaign();

      const uuidV4 = require('uuid/v4');
      let email_templates = MockEntities.getValidEmailTemplates([uuidV4()], 'test');

      let smtp_provider = MockEntities.getValidSMTPProvider();

      smtp_provider.hostname = 'email-smtp.us-east-1.amazonaws.com';
      smtp_provider.username = 'AKIAJJOKTKQDYPLK6YMQ';
      smtp_provider.password = 'AjMskin0Tp5XJRnumOHEWaswTtv54khpDtwiIYS5N8Ia';
      smtp_provider.port = 465;
      smtp_provider.from_email = 'tmdalbey@gmail.com'

      email_templates = arrayutilities.map(email_templates, email_template => {
        email_template.subject = 'Thank you for your purchase!';
        email_template.body = 'Thank you {{customer.firstname}} for your purchase!';
        email_template.smtp_provider = smtp_provider.id;
        return email_template;
      });

      let message = {
        event_type:"test",
        account:'d3fa3bf3-7824-49f4-8261-87674482bf1c',
        user:"system@sixcrm.com",
        context:{
          campaign:campaign,
          customer:customer
        }
      };

      let sns_message = MockEntities.getValidSNSMessage(message);

      mockery.registerMock(global.SixCRM.routes.path('entities','Campaign.js'), {
        get:() =>{
          return Promise.resolve(campaign);
        },
        getEmailTemplates:() => {
          return Promise.resolve(email_templates);
        },
        isUUID:() => {
          return true;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities','Customer.js'), {
        get:() =>{
          return Promise.resolve(customer);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities','EmailTemplate.js'), {
        get:({id}) =>{
          return Promise.resolve(MockEntities.getValidEmailTemplate(id));
        },
        getSMTPProvider:() => {
          return Promise.resolve(smtp_provider);
        }
      });

      /*

      mockery.registerMock(global.SixCRM.routes.path('helpers','email/CustomerMailer.js'), class {
        constructor(){
        }
        sendEmail(options){
          du.highlight(options);
          return true;
        }
      });
      */

      let eventEmailsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/eventEmails.js');

      return eventEmailsController.execute(sns_message).then(result => {
        expect(result).to.equal(true);
      });
    });

    it('successfully executes (mock)', () => {

      let customer = MockEntities.getValidCustomer();
      /*
      customer.email = 'tmdalbey+2@gmail.com';
      customer.firstname = 'Timothy';
      customer.lastname = 'Dalbey';
      */

      let campaign = MockEntities.getValidCampaign();

      //const uuidV4 = require('uuid/v4');
      //let email_templates = MockEntities.getValidEmailTemplates([uuidV4()], 'test');
      let email_templates = MockEntities.getValidEmailTemplates(null, 'test');

      let smtp_provider = MockEntities.getValidSMTPProvider();
      /*
      smtp_provider.hostname = 'email-smtp.us-east-1.amazonaws.com';
      smtp_provider.username = 'AKIAJJOKTKQDYPLK6YMQ';
      smtp_provider.password = 'AjMskin0Tp5XJRnumOHEWaswTtv54khpDtwiIYS5N8Ia';
      smtp_provider.port = 465;
      smtp_provider.from_email = 'tmdalbey@gmail.com'
      */

      email_templates = arrayutilities.map(email_templates, email_template => {
        email_template.subject = 'Thank you for your purchase!';
        email_template.body = 'Thank you {{customer.firstname}} for your purchase!';
        email_template.smtp_provider = smtp_provider.id;
        return email_template;
      });

      let message = {
        event_type:"test",
        account:'d3fa3bf3-7824-49f4-8261-87674482bf1c',
        user:"system@sixcrm.com",
        context:{
          campaign:campaign,
          customer:customer
        }
      };

      let sns_message = MockEntities.getValidSNSMessage(message);

      mockery.registerMock(global.SixCRM.routes.path('entities','Campaign.js'), {
        get:() =>{
          return Promise.resolve(campaign);
        },
        getEmailTemplates:() => {
          return Promise.resolve(email_templates);
        },
        isUUID:() => {
          return true;
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities','Customer.js'), {
        get:() =>{
          return Promise.resolve(customer);
        }
      });

      mockery.registerMock(global.SixCRM.routes.path('entities','EmailTemplate.js'), {
        get:({id}) =>{
          return Promise.resolve(MockEntities.getValidEmailTemplate(id));
        },
        getSMTPProvider:() => {
          return Promise.resolve(smtp_provider);
        },
        sanitize: () => {}
      });

      mockery.registerMock(global.SixCRM.routes.path('helpers','email/CustomerMailer.js'), class {
        constructor(){
        }
        sendEmail(options){
          du.highlight(options);
          return true;
        }
      });

      let eventEmailsController = global.SixCRM.routes.include('controllers', 'workers/snsevent/eventEmails.js');

      return eventEmailsController.execute(sns_message);

    });

  });

});
