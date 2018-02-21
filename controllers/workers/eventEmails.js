'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const parserutilities = global.SixCRM.routes.include('lib', 'parser-utilities.js');

const CustomerHelperController = global.SixCRM.routes.include('helpers', 'entities/customer/Customer.js');
const CustomerMailerHelper = global.SixCRM.routes.include('helpers', 'email/CustomerMailer.js');
const Parameters = global.SixCRM.routes.include('providers', 'Parameters.js');

class EventEmailsController {

  constructor(){

    this.parameter_definition = {
      execute:{
        required: {
          records: 'Records'
        },
        optional:{}
      }
    };

    this.parameter_validation = {
      'records': global.SixCRM.routes.path('model', 'workers/eventEmails/records.json'),
      'message':global.SixCRM.routes.path('model','workers/eventEmails/message.json'),
      'record':global.SixCRM.routes.path('model','workers/eventEmails/snsrecord.json'),
      'campaign':global.SixCRM.routes.path('model','entities/campaign.json'),
      'customer':global.SixCRM.routes.path('model','entities/customer.json'),
      'smtpproviders':global.SixCRM.routes.path('model','entities/components/smtpproviders.json'),
      'emailtemplates':global.SixCRM.routes.path('model','entities/components/emailtemplates.json')
    };

    this.parameters = new Parameters({validation: this.parameter_validation, definition: this.parameter_definition});

    this.campaignController = global.SixCRM.routes.include('entities', 'Campaign.js');
    this.customerController = global.SixCRM.routes.include('entities', 'Customer.js');
    this.emailTemplatesController = global.SixCRM.routes.include('entities', 'EmailTemplate.js');

    this.setPermissions();

  }

  setPermissions(){

    du.debug('Set Permissions');

    this.permissionutilities = global.SixCRM.routes.include('lib','permission-utilities.js');
    this.permissionutilities.setPermissions('*',['*/*'],[])

  }

  execute(){

    du.info(arguments[0]);

    return Promise.resolve()
    .then(() => this.parameters.setParameters({argumentation: arguments[0], action:'execute'}))
    .then(() => this.handleEvents())

  }

  handleEvents(){

    du.debug('Handle Events');

    let records = this.parameters.get('records');

    let event_promises = arrayutilities.map(records, record => {
      return () => this.handleEventRecord(record);
    });

    //Technical Debt:  This would be great if it did all this stuff asyncronously down the road
    return arrayutilities.reduce(
      event_promises,
      (current, event_promise) => {
        return event_promise().then(() => {
          return true;
        })
      },
      Promise.resolve(true)
    ).then(() => {
      return true;
    });

  }

  handleEventRecord(record){

    du.debug('Handle Event Record');

    return Promise.resolve()
    .then(() => this.parameters.set('record', record))
    .then(() => this.getMessage())
    .then(() => this.triggerEmails())
    .then(() => this.cleanUp());

  }

  getMessage(){

    du.debug('Get Message');

    let record = this.parameters.get('record');

    let message = record.Sns.Message;

    try{
      message = JSON.parse(message);
    }catch(error){
      du.error(error);
      eu.throwError(error);
    }

    this.parameters.set('message', message);

    return true;

  }

  triggerEmails(){

    du.debug('Trigger Emails');

    return this.acquireCampaign()
    .then(() => this.acquireCustomer())
    .then(() => this.acquireEmailTemplates())
    .then(() => this.acquireSMTPProviders())
    .then(() => this.sendEmails())
    .catch(error => {
      du.error(error);
      return true;
    });

  }

  acquireCampaign(){

    du.debug('Acquire Campaign');

    let message = this.parameters.get('message');

    let campaign = objectutilities.recurseByDepth(message.context, (key, value) => {

      if(key == 'campaign'){
        if(_.isObject(value) && _.has(value, 'id')){
          return true;
        }
        if(_.isString(value) && this.campaignController.isUUID(value)){
          return true;
        }
      }

      return false;

    });

    if(_.isUndefined(campaign) || _.isNull(campaign)){
      eu.throwError('server', 'Unable to identify campaign');
    }

    return this.campaignController.get({id: campaign}).then(result => {
      this.parameters.set('campaign', result);
      return true;
    });

  }

  acquireCustomer(){

    du.debug('Acquire Customer');

    let message = this.parameters.get('message');

    let customer = objectutilities.recurseByDepth(message.context, (key, value) => {

      if(key == 'customer'){
        if(_.isObject(value) && _.has(value, 'id')){
          return true;
        }
        if(_.isString(value) && this.customerController.isUUID(value)){
          return true;
        }
      }

      return false;

    });

    if(_.isUndefined(customer) || _.isNull(customer)){
      eu.throwError('server', 'Unable to identify customer');
    }

    return this.customerController.get({id: customer}).then((result) => {
      this.parameters.set('customer', result);
      return true;
    });

  }

  acquireEmailTemplates(){

    du.debug('Acquire Email Templates');

    let message = this.parameters.get('message');
    let campaign = this.parameters.get('campaign');

    return this.campaignController.getEmailTemplates(campaign).then(results => {

      if(_.isNull(results) || !arrayutilities.nonEmpty(results)){
        return true;
      }

      let email_templates = arrayutilities.filter(results, result => {
        return result.type == message.event_type;
      });

      return email_templates;

    }).then(results => {

      if(!_.isNull(results) && arrayutilities.nonEmpty(results)){
        this.parameters.set('emailtemplates', results);
        return true;
      }

      return false;

    });

  }

  acquireSMTPProviders(){

    du.debug('Acquire SMTP Provider');

    let email_templates = this.parameters.get('emailtemplates', null, false);

    if(!_.isNull(email_templates)){

      let smtp_provider_promises = arrayutilities.map(email_templates, email_template => {
        return this.emailTemplatesController.getSMTPProvider(email_template);
      });

      return Promise.all(smtp_provider_promises).then(results => {
        let smtp_providers = arrayutilities.filter(results, result => {
          return !_.isNull(result);
        })

        this.parameters.set('smtpproviders', smtp_providers);
        return true;
      });

    }

    return true;

  }

  sendEmails(){

    du.debug('Send Emails');

    let email_templates  = this.parameters.get('emailtemplates', null, false);

    if(_.isNull(email_templates) || !arrayutilities.nonEmpty(email_templates)){
      return true;
    }

    let email_promises = arrayutilities.map(email_templates, email_template => {
      return this.sendEmail(email_template);
    });

    return Promise.all(email_promises).then(() => {
      return true;
    });

  }

  sendEmail(email_template){

    du.debug('Send Email');

    let customer = this.parameters.get('customer');
    let paired_smtp_provider = this.getPairedSMTPProvider(email_template);
    let parsed_email_template = this.parseEmailTemplate(email_template);

    let options = {
      sender_email: paired_smtp_provider.from_email,
      sender_name: paired_smtp_provider.from_name,
      subject: parsed_email_template.subject,
      body: parsed_email_template.body,
      recepient_emails:[customer.email],
      recepient_name: this.createCustomerFullName()
    };

    let customerEmailer = new CustomerMailerHelper({smtp_provider: paired_smtp_provider});

    return customerEmailer.sendEmail({send_options: options})

  }

  getPairedSMTPProvider(email_template){

    du.debug('Get Paired SMTP Provider');

    let smtp_providers = this.parameters.get('smtpproviders');

    let paired_smtp_provider = arrayutilities.find(smtp_providers, smtp_provider => {
      return (email_template.smtp_provider == smtp_provider.id);
    });

    if(_.isUndefined(paired_smtp_provider) || _.isNull(paired_smtp_provider)){
      eu.throwError('server', 'No SMTP provider configured for use with email template: '+email_template.id);
    }

    return paired_smtp_provider;

  }

  createCustomerFullName(){

    du.debug('Create Customer Full Name');

    let customer = this.parameters.get('customer');

    let customerHelperController = new CustomerHelperController();

    return customerHelperController.getFullName(customer);

  }

  parseEmailTemplate(email_template){

    du.debug('Parse Email Template');

    let parse_object = this.createParseObject();

    return {
      subject: parserutilities.parse(email_template.subject, parse_object),
      body: parserutilities.parse(email_template.body, parse_object)
    };

  }

  createParseObject(){

    du.debug('Create Parse Object');

    let parse_object = {
      campaign: this.parameters.get('campaign'),
      customer: this.parameters.get('customer')
    }

    let optional_properties = {
      rebill: null,
      transactions: null,
      transaction: null,
      creditcard:null,
      session: null
    }

    let message = this.parameters.get('message');

    objectutilities.map(optional_properties, optional_property => {
      optional_properties[optional_property] = objectutilities.recurseByDepth(message.context, (key) => {
        return (key == optional_property);
      });
    });

    return objectutilities.merge(parse_object, optional_properties);

  }

  cleanUp(){

    du.debug('Clean Up');

    this.parameters.unset('record');
    this.parameters.unset('message');
    this.parameters.unset('campaign');
    this.parameters.unset('customer');
    this.parameters.unset('smtpproviders');
    this.parameters.unset('emailtemplates');

    return true;

  }

}

module.exports = new EventEmailsController();
