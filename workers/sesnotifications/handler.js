'use strict';
var aws = require('aws-sdk');
const du = require('../../lib/debug-utilities.js');
const _ = require('underscore');

//Technical Debt:  Configure the Table Name here...
var ddb = new aws.DynamoDB({params: {TableName: process.env.ses_notifications_table}});

module.exports.sesnotifications = function(event, context, callback){
		
	  du.output('Received event:', JSON.stringify(event, null, 2));

	  var SnsPublishTime = event.Records[0].Sns.Timestamp;

	  var SnsTopicArn = event.Records[0].Sns.TopicArn;

	  var SESMessage = event.Records[0].Sns.Message;
		
	  try{
	  
	  	SESMessage = JSON.parse(SESMessage);
	  
	  }catch(error){
	  	
	  	du.warning('Unable to parse message');
	  	
	  	context.fail(error);
	  	
	  }

	  var SESMessageType = SESMessage.notificationType;

      if(_.has(SESMessage, 'mail')){
      
      	if(_.has(SESMessage.mail, 'messageId')){
	  
	  		var SESMessageId = SESMessage.mail.messageId;
	  		
	  	}
	  	
	  	if(_.has(SESMessage.mail, 'destination')){
	  		
	  		 var SESDestinationAddress = SESMessage.mail.destination.toString();
	  		 
	  	}
	  
	  }

	  var LambdaReceiveTime = new Date().toString();
		
      du.output('Message Type:', SESMessageType);
      
	  if (SESMessageType == 'Bounce'){
		
	  	var SESreportingMTA = SESMessage.bounce.reportingMTA;

	  	var SESbounceSummary = JSON.stringify(SESMessage.bounce.bouncedRecipients);

	  	var itemParams = {Item: {SESMessageId: {S: SESMessageId}, SnsPublishTime: {S: SnsPublishTime},

	  	SESreportingMTA: {S: SESreportingMTA}, SESDestinationAddress: {S: SESDestinationAddress}, SESbounceSummary: {S: SESbounceSummary},

	  	SESMessageType: {S: SESMessageType}}};

		ddb.putItem(itemParams, function(err, data){

	  		if(err) { 
	  		
	  			context.fail(err);

	  		} else {

			   du.output(data);

			   context.succeed();

		  }

	  });

	}else if (SESMessageType == 'Delivery'){

	  var SESsmtpResponse1 = SESMessage.delivery.smtpResponse;

	  var SESreportingMTA1 = SESMessage.delivery.reportingMTA;

	  var itemParamsdel = {Item: {SESMessageId: {S: SESMessageId}, SnsPublishTime: {S: SnsPublishTime}, SESsmtpResponse: {S: SESsmtpResponse1},

	  SESreportingMTA: {S: SESreportingMTA1},

	  SESDestinationAddress: {S: SESDestinationAddress }, SESMessageType: {S: SESMessageType}}};

	  ddb.putItem(itemParamsdel, function(err, data){

		if(err) { 
			
			context.fail(err)
		
		}else{

			  du.output(data);

			  context.succeed();

		}

	  });

	}else if (SESMessageType == 'Complaint'){

		var SESComplaintFeedbackType = SESMessage.complaintFeedbackType;

		var SESFeedbackId = SESMessage.feedbackId;

		var itemParamscomp = {Item: {SESMessageId: {S: SESMessageId}, SnsPublishTime: {S: SnsPublishTime}, SESComplaintFeedbackType: {S: SESComplaintFeedbackType},

		SESFeedbackId: {S: SESFeedbackId},

		SESDestinationAddress: {S: SESDestinationAddress }, SESMessageType: {S: SESMessageType}}};

		ddb.putItem(itemParamscomp, function(err, data){

		  if(err){ 
			context.fail(err)
		  }else{
			du.output(data);
			context.succeed();
		  }

		});

	}else{
		
		context.succeed();
		
	}

}