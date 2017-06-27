'use strict'
const _ = require('underscore');

const nodemailer = require('nodemailer');
const striptags = require('striptags');

const du = global.routes.include('lib', 'debug-utilities.js');
const mvu = global.routes.include('lib', 'model-validator-utilities.js');
const arrayutilities = global.routes.include('lib', 'array-utilities.js');

module.exports = class SMTPUtilities {

    constructor(options){

        this.secure_ports = [465];

        this.connect(options);

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

        if(_.has(options, 'port')){
            connection_object.port = options.port;
        }

        if(_.has(connection_object, 'port') && _.contains(this.secure_ports, connection_object.port)){
            connection_object.secure = true;
        }

        connection_object = this.addDefaults(connection_object);

        this.connection = nodemailer.createTransport(connection_object);

    }

    addDefaults(connection_object){

        connection_object['tls'] = { rejectUnauthorized: false };

        return connection_object;

    }

    validateConnectionOptions(options){

        mvu.validateModel(options, global.routes.path('model','general/smtp_connection_options.json'));

    }

    createFromString(name, email){

        let escaped_name = name.replace(/"/g, '\\"');

        return '"'+escaped_name+'" <'+email+'>';

    }

    createToString(to_array){

        return arrayutilities.compress(to_array, ', ','');

    }

    stripHTML(string_object){

        return striptags(string_object);

    }

    //Technical Debt: Complete...
    validateSendObject(send_object){

        try{

            mvu.validateModel(send_object, global.routes.path('model','general/smtp_send_object.json'));

        }catch(error){

            return Promise.reject(error);

        }

        return Promise.resolve(true);

    }

    //Technical Debt: Complete...
    sanitizeSubject(subject_string){

        return subject_string;

    }

    setMailOptions(send_object){

        du.info(send_object);

        let from_string = this.createFromString(send_object.sender_name, send_object.sender_email);
        let to_string = this.createToString(send_object.recepient_emails);
        let text = this.stripHTML(send_object.body);
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

        return new Promise((resolve, reject) => {

            if(!_.has(this, 'connection')){ return reject(new Error('SMTP library missing connection.')); }

            return this.validateSendObject(send_object).then((validated) => {

                let mail_options = this.setMailOptions(send_object);

                this.connection.sendMail(mail_options, (error, info) => {

                    if (error) { return reject(error); }

                    du.warning('Message '+info.messageId+' sent: '+info.response);

                    return resolve(info);

                });

            });

        });

    }

}
