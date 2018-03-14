'use strict'

const mockery = require('mockery');
const chai = require('chai');
const expect = chai.expect;

const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');

function createValidConnectionObject(){

  return {
    hostname: global.SixCRM.configuration.site_config.ses.hostname,
    password: global.SixCRM.configuration.site_config.ses.smtp_password,
    username: global.SixCRM.configuration.site_config.ses.smtp_username,
    port: global.SixCRM.configuration.site_config.ses.port
  }

}

function createValidEmailObject(){

  return {
    sender_email:'test@sixcrm.com',
    sender_name:'Test Email at SixCRM',
    subject:'This is a test email',
    body:'This email was sent as a part of a SixCRM unit test.',
    recepient_emails:['test2@sixcrm.com'],
    recepient_name:'Test Email 2 at SixCRM'
  };

}

describe('lib/smtp-utilities', () => {

  it('should instantiate', () => {

    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    expect(objectutilities.getClassName(smtputilities)).to.equal('SMTPUtilities');

  });

  it('should add default information to connection parameters', () => {

    let connection_options = createValidConnectionObject();

    delete connection_options.port;

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    connection_options = smtputilities.addDefaults(connection_options);

    expect(connection_options).to.have.property('tls');

    expect(connection_options).to.have.property('port');

  });

  it('should validate a good connection object', () => {

    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    let validation_error = null;

    try{
      smtputilities.validateConnectionOptions(connection_options, true);
    }catch(error){
      validation_error = error;
    }

    expect(validation_error).to.equal(null);

  });

  it('should fail to validate a connection object (missing hostname)', () => {

    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    delete connection_options.hostname;

    try{
      smtputilities.validateConnectionOptions(connection_options, true);
    }catch(error){
      expect(error.message).to.have.string('[500] One or more validation errors occurred:');
    }

  });

  it('should fail to validate a connection object (missing username)', () => {

    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    delete connection_options.username;

    try{
      smtputilities.validateConnectionOptions(connection_options, true);
    }catch(error){
      expect(error.message).to.have.string('[500] One or more validation errors occurred:');
    }

  });

  it('should fail to validate a connection object (missing password)', () => {

    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    delete connection_options.password;

    try{
      smtputilities.validateConnectionOptions(connection_options, true);
    }catch(error){
      expect(error.message).to.have.string('[500] One or more validation errors occurred:');
    }

  });


  it('should fail to validate a connection object (missing password)', () => {

    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    delete connection_options.password;

    try{
      smtputilities.validateConnectionOptions(connection_options, true);
    }catch(error){
      expect(error.message).to.have.string('[500] One or more validation errors occurred:');
    }

  });

  it('should validate a good email object', () => {

    let email_object = createValidEmailObject();
    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    smtputilities.validateSendObject(email_object);

  });

  it('should fail to validate a email object (missing recepient_emails)', () => {

    let email_object = createValidEmailObject();
    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    delete email_object.recepient_emails;

    try{
      smtputilities.validateSendObject(email_object);
    }catch(error){
      expect(error.message).to.have.string('[500] One or more validation errors occurred:');
    }

  });

  it('should fail to validate a email object (incorrect recepient_emails formatting)', () => {

    let email_object = createValidEmailObject();
    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    let bad = [[], '', 'a', 123, {}, false, null, ['randal'], ['test@test'], 'test@test.com', ['test@test.com', ''], ['test@test.com',[]]];

    arrayutilities.map(bad, (bad_thing) => {

      email_object.recepient_emails = bad_thing;

      try{
        smtputilities.validateSendObject(email_object);
      }catch(error){
        expect(error.message).to.have.string('[500] One or more validation errors occurred:');
      }

    });

  });

  it('should fail to validate a email object (incorrect recepient_name formatting)', () => {

    let email_object = createValidEmailObject();
    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    let bad = [[], '', 'a', 123, {}, false, null, ['randal']];

    arrayutilities.map(bad, (bad_thing) => {

      email_object.recepient_name = bad_thing;

      try{
        smtputilities.validateSendObject(email_object);
      }catch(error){
        expect(error.message).to.have.string('[500] One or more validation errors occurred:');
      }

    });

  });

  it('should fail to validate a email object (incorrect body formatting)', () => {

    let email_object = createValidEmailObject();
    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    let bad_bodies = [[], '', 'a', 123, {}, false, null];

    arrayutilities.map(bad_bodies, (bad_body) => {

      email_object.body = bad_body;

      try{
        smtputilities.validateSendObject(email_object);
      }catch(error){
        expect(error.message).to.have.string('[500] One or more validation errors occurred:');
      }

    });

  });

  it('should fail to validate a email object (incorrect subject formatting)', () => {

    let email_object = createValidEmailObject();
    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    let bad = [[], '', 'a', 123, {}, false, null];

    arrayutilities.map(bad, (bad_thing) => {

      email_object.subject = bad_thing;

      try{
        smtputilities.validateSendObject(email_object);
      }catch(error){
        expect(error.message).to.have.string('[500] One or more validation errors occurred:');
      }

    });

  });

  it('should appropriately create the "toString"', () => {

    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    let escaped_string = smtputilities.createToString(['test@test.com', 'test2@test.com', 'test@test.com']);

    expect(escaped_string).to.equal('test@test.com, test2@test.com');

  });

  it('should appropriately create the "from string"', () => {

    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    let from_string = smtputilities.createFromString('Testing" at Six', 'test@sixcrm.com');

    expect(from_string).to.equal('"Testing\\" at Six" <test@sixcrm.com>');

  });

  it('should create connection object from site config', () => {

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities();

    smtputilities.connect = () => {};

    let connection_options = smtputilities.createConnectionObjectFromSiteConfig();

    expect(connection_options.hostname).to.match(/email-smtp.us-[a-zA-Z]+-[0-9].amazonaws.com/);
    expect(connection_options.password).to.be.defined;
    expect(connection_options.username).to.be.defined;

  });

  it('should prepare mail options', () => {

    let connection_options = createValidConnectionObject();

    let email_object = createValidEmailObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    expect(smtputilities.setMailOptions(email_object)).to.deep.equal({
        from: '\"' + email_object.sender_name + '\" <' + email_object.sender_email + '>',
        html: email_object.body,
        subject: email_object.subject,
        text: email_object.body,
        to: email_object.recepient_emails[0]
    });

  });

  it('throws error when SMTP library is missing connection', () => {

    let connection_options = createValidConnectionObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    delete smtputilities.connection;

    return smtputilities.send({}).catch((error) => {
        expect(error.message).to.equal('[500] SMTP library missing connection.');
    });

  });

  it('throws error when mail is not successfully sent', () => {

    let connection_options = createValidConnectionObject();

    let email_object = createValidEmailObject();

    const SMTPUtilities = global.SixCRM.routes.include('lib', 'smtp-utilities.js');
    let smtputilities = new SMTPUtilities(connection_options);

    smtputilities.connect = () => {};

    smtputilities.connection.sendMail = (params, callback) => {
        callback(new Error('Sending failed.'), null);
    };

    return smtputilities.send(email_object).catch((error) => {
        expect(error.message).to.equal('Sending failed.');
    });

  });


  xit('should send a email', () => {

    expect(true).to.equal(false);

  });

});
