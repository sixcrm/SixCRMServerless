'use strict'
const AWS = require("aws-sdk");
const _ = require('underscore');
const du = require('./debug-utilities.js');

class SESUtilities {
	
	constructor(){
		
		var parameters = {apiVersion: 'latest', region: 'us-east-1'};

		this.ses = new AWS.SES(parameters);
		
		this.setConfigurationParameters();
		
	}
	
	setConfigurationParameters(){
		
		this.default_source = 	'info@sixcrm.com';
		this.default_reply_to = 'info@sixcrm.com';
		this.default_charset = 	'UTF-8';
		
		//this.verifyEmails();
		//this.source_arn = 'arn:aws:ses:us-east-1:068070110666:identity/sixcrm.com';
		
	}
	
	verifyEmails(){
		this.ses.verifyEmailIdentity({EmailAddress:'tmdalbey@gmail.com'}, function(error, data){
			if(error){
				du.warning(error);
			}
			du.warning(data);
			du.warning('verification email sent');
		});
	}
	
	sendEmail(parameters){
		
		return new Promise((resolve, reject) => {
		
			du.debug('SES Pre-formatted parameters', parameters);
			
			this.createParametersObject(parameters).then((ses_formatted_parameters) => {
				
				du.debug('SES Parameters', ses_formatted_parameters);
				
				this.ses.sendEmail(ses_formatted_parameters, function(error, data) {
						
					if(error){
						
						du.debug('SES Error!', error);
							
						return reject(error);
						
					}else{
						
						du.debug('SES Success:', data);
						
						return resolve(data);
						
					}
					
				});
			
			});
			
		});

	}
	
	validateParameters(parameters){
		
		//Technical Debt: validate the parameters 
		/*
		parameters = {
			to: ['test@dummy.com'],
			body: {
				html:"",
				text:""
			},
			subject: "",
			source: "",
			reply_to: ["someaddress@test.com"],
		};	
		*/
		
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

var ses = new SESUtilities(process.env.stage);
module.exports = ses;