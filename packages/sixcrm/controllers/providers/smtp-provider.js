
const _ = require('lodash');
const nodemailer = require('nodemailer');
const eu = require('@6crm/sixcrmcore/lib/util/error-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/lib/util/array-utilities').default;
const stringutilities = require('@6crm/sixcrmcore/lib/util/string-utilities').default;

module.exports = class SMTPProvider {

	constructor(options){

		this.default_port = 465;

		this.secure_ports = [this.default_port];

		if(_.isUndefined(options) || _.isNull(options)){

			options = this.createConnectionObjectFromSiteConfig();

		}

		this.connect(options);

	}

	createConnectionObjectFromSiteConfig(){
		return {
			hostname: global.SixCRM.configuration.site_config.ses.hostname,
			password: global.SixCRM.configuration.site_config.ses.smtp_password,
			username: global.SixCRM.configuration.site_config.ses.smtp_username,
		};

	}

	connect(options){
		this.validateConnectionOptions(options, true);

		let connection_object = {
			host: options.hostname,
			port: options.port,
			auth: {
				user: options.username,
				pass: options.password
			}
		};

		connection_object = this.addDefaults(connection_object);

		if(_.has(connection_object, 'port') && _.includes(this.secure_ports, connection_object.port)){
			connection_object.secure = true;
		}

		this.connection = nodemailer.createTransport(connection_object);

	}

	addDefaults(connection_object){
		if(!_.has(connection_object, 'tls')){

			connection_object['tls'] = { rejectUnauthorized: false };

		}

		if(!_.has(connection_object, 'port')){
			connection_object['port'] = this.default_port;
		}

		return connection_object;

	}

	validateConnectionOptions(options){
		global.SixCRM.validate(options, global.SixCRM.routes.path('model','general/smtp_connection_options.json'));

	}

	createFromString(name, email){
		let escaped_name = stringutilities.escapeCharacter(name, '"');

		return '"'+escaped_name+'" <'+email+'>';

	}

	createToString(to_array){
		return arrayutilities.compress(arrayutilities.unique(to_array), ', ','');

	}

	validateSendObject(send_object){
		global.SixCRM.validate(send_object, global.SixCRM.routes.path('model','general/smtp_send_object.json'));

	}

	//Technical Debt: Complete...
	sanitizeSubject(subject_string){
		return subject_string;

	}

	setMailOptions(send_object){
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
		return new Promise((resolve, reject) => {

			if(!_.has(this, 'connection')){ return reject(eu.getError('validation','SMTP library missing connection.')); }

			this.validateSendObject(send_object);

			let mail_options = this.setMailOptions(send_object);

			return this.connection.sendMail(mail_options, (error, info) => {

				if (error) { return reject(error); }

				return resolve(info);

			});

		});

	}

}
