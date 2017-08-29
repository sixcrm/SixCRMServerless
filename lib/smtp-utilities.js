'use strict'
const _ = require('underscore');
const nodemailer = require('nodemailer');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');

module.exports = class SMTPUtilities {

    constructor(options){

      this.default_port = 465;

      this.secure_ports = [this.default_port];

      if(_.isUndefined(options) || _.isNull(options)){

        options = this.createConnectionObjectFromSiteConfig();

      }

      this.connect(options);

    }

    createConnectionObjectFromSiteConfig(){

      du.debug('Create Connection Object From Site Config');

      return {
        hostname: global.SixCRM.configuration.site_config.ses.hostname,
        password: global.SixCRM.configuration.site_config.ses.smtp_password,
        username: global.SixCRM.configuration.site_config.ses.smtp_username,
      };

    }

    connect(options){

        du.debug('Connect');

        this.validateConnectionOptions(options, true);

        let connection_object = {
            host: options.hostname,
            auth: {
                user: options.username,
                pass: options.password
            }
        };

        connection_object = this.addDefaults(connection_object);

        if(_.has(connection_object, 'port') && _.contains(this.secure_ports, connection_object.port)){
            connection_object.secure = true;
        }

        this.connection = nodemailer.createTransport(connection_object);

    }

    addDefaults(connection_object){

      du.debug('Add Defaults');

      if(!_.has(connection_object, 'tls')){

          connection_object['tls'] = { rejectUnauthorized: false };

      }

      if(!_.has(connection_object, 'port')){
        connection_object['port'] = this.default_port;
      }

      return connection_object;

    }

    validateConnectionOptions(options){

      du.debug('Validate Connection Options');

      mvu.validateModel(options, global.SixCRM.routes.path('model','general/smtp_connection_options.json'));

    }

    createFromString(name, email){

      du.debug('Create From String');

      let escaped_name = stringutilities.escapeCharacter(name, '"');

      return '"'+escaped_name+'" <'+email+'>';

    }

    createToString(to_array){

      du.debug('Create To String');

      return arrayutilities.compress(arrayutilities.unique(to_array), ', ','');

    }

    validateSendObject(send_object){

      du.debug('Validate Send Object');

      mvu.validateModel(send_object, global.SixCRM.routes.path('model','general/smtp_send_object.json'));

    }

    //Technical Debt: Complete...
    sanitizeSubject(subject_string){

      du.debug('Sanitize Subject');

      return subject_string;

    }

    setMailOptions(send_object){

      du.debug('Set Mail Options');

      let from_string = this.createFromString(send_object.sender_name, send_object.sender_email);
      let to_string = this.createToString(send_object.recepient_emails);
      let text = stringutilities.stripHTML(send_object.body);
      let html = send_object.body;
      let subject = this.sanitizeSubject(send_object.subject);

      let mailOptions = {
          from: from_string,
          to: to_string,
          subject: subject,
          text: text,
          html: html
      };

      return mailOptions;

    }

    send(send_object){

      du.debug('Send');

      return new Promise((resolve, reject) => {

        if(!_.has(this, 'connection')){ return reject(eu.getError('validation','SMTP library missing connection.')); }

        this.validateSendObject(send_object);

        let mail_options = this.setMailOptions(send_object);

        return this.connection.sendMail(mail_options, (error, info) => {

          if (error) { return reject(error); }

          du.warning('Message '+info.messageId+' sent: '+info.response);

          return resolve(info);

        });

      });

    }

}
