
const _ = require('lodash');
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const AWSProvider = global.SixCRM.routes.include('controllers', 'providers/aws-provider.js');

module.exports = class SESProvider extends AWSProvider{

	constructor(){

		super();

		var parameters = {
			apiVersion: 'latest',
			region: this.getRegion()
		};

		//Technical Debt:  Get this out of the constructor?
		this.instantiateAWS();

		this.ses = new this.AWS.SES(parameters);

		this.setConfigurationParameters();

	}

	setConfigurationParameters(){

		//Techincal Debt:  These need to be configured.
		this.default_source = 	'info@sixcrm.com';
		this.default_reply_to = 'info@sixcrm.com';
		this.default_charset = 	'UTF-8';

		//this.verifyEmails();
		//this.source_arn = 'arn:aws:ses:us-east-1:068070110666:identity/sixcrm.com';

	}

	verifyEmails(){
		this.ses.verifyEmailIdentity({EmailAddress:'tmdalbey@gmail.com'}, function(error){
			if(error){
				du.warning(error);
			}
		});
	}

	sendEmail(parameters){

		return new Promise((resolve, reject) => {

			return this.createParametersObject(parameters).then((ses_formatted_parameters) => {

				return this.ses.sendEmail(ses_formatted_parameters, function(error, data) {

					if(error){

						return reject(error);

					}else{

						return resolve(data);

					}

				});

			});

		});

	}

	validateParameters(parameters){

		//Technical Debt: validate the parameters
		return parameters;

	}

	createParametersObject(parameters){

		return new Promise((resolve) => {

			let params = {};

			if(_.has(parameters, 'to')){
				if(_.isArray(parameters.to)){
					params.Destination = {
						ToAddresses: parameters.to
					};
				}else if(_.isString(parameters.to)){
					params.Destination = {
						ToAddresses: [parameters.to]
					};
				}
			}

			if(_.has(parameters, 'body')){

				if(_.has(parameters.body, 'html')){

					params.Message = {
						Body: {
							Html: {
								Data: parameters.body.html,
								Charset: this.default_charset
							}
						}
					};

				}else if(_.has(parameters.body, 'text')){

					params.Message = {
						Body: {
							Text: {
								Data: parameters.body.text,
								Charset: this.default_charset
							}
						}
					};

				}

			}

			if(_.has(parameters, 'subject')){

				params.Message.Subject = {
					Data: parameters.subject,
					Charset: this.default_charset
				}

			}

			if(_.has(parameters, 'reply_to')){

				if(_.isArray(parameters.reply_to)){
					params.ReplyToAddresses = parameters.reply_to;
				}else if(_.isString(parameters.reply_to)){
					params.ReplyToAddresses = [parameters.reply_to];
				}

			}else{
				//params.ReplyToAddresses = [this.default_reply_to];
			}

			if(_.has(parameters, 'source')){
				params.Source = parameters.source;
			}else{
				params.Source = this.default_source;
			}

			if(_.has(parameters, 'source_arn')){

				params.SourceArn = parameters.source_arn;

			}else if(_.has(this, 'source_arn')){

				params.SourceArn = this.source_arn;

			}

			return resolve(params);

		});

	}

}

