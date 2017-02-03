'use strict';
var AWS = require("aws-sdk");

var lr = require('../../lib/lambda-response.js');
var rebillController = require('../../controllers/Rebill.js');

module.exports.processbilling = (event, context, callback) => {
    
    /*
    
    {
		"billdate": 1485842247,
		"parentsession": "668ad918-0d09-4116-a6fe-0e8a9eda36f7",
		"product_schedules": [
			"12529a17-ac32-4e46-b05b-83862843055d"
		],
		"amount": "34.99",
		"id": "55c103b4-670a-439e-98d4-5a2834bb5fc3",
		"products": [
			"be992cea-e4be-4d3e-9afa-8e020340ed16"
		]
	}

    */
    rebillController.getParentSession(event).then((session) => {
		
			
			
			
	});

    
    
    //note we need the session...

    
	//
    //execute billing
    	
	lr.issueResponse(200, {
		message: 'Success'
	}, callback);        

}

/*
loadBalancerController.process(campaign.loadbalancer, {customer: customer, creditcard: creditcard, amount: amount}).then((processor_response) => {
							
							//this is intended to process multiple product schedules purchased...																	
							rebillController.createRebills(session, schedules_to_purchase, 0).then((rebill) =>{
								
								//hack, we need to support multiple schedules in a single order
								rebill = rebill[0];
								
								transactionController.putTransaction({session: session, rebill: rebill, amount: amount}, processor_response).then((transaction) => {
									
									if(!_.isObject(transaction) || !_.has(transaction, 'id')){ throw new Error('No available transaction.');}
									
									//this looks like a hack as well	
									var transactions = [transaction.id];
									
									rebillController.updateRebillTransactions(rebill, transactions).then((rebill) => {
									
										if(_.has(processor_response, "message") && processor_response.message == 'Success' && _.has(processor_response, "results") && _.has(processor_response.results, 'response') && processor_response.results.response == '1'){	
			
											rebillController.addRebillToQueue(rebill, 'hold').then(() => {
										
												rebillController.createRebills(session, schedules_to_purchase).then((nextrebill) => {
											
													sessionController.updateSessionProductSchedules(session, schedules_to_purchase).then((session) => {

														lr.issueResponse(200, {
															message: 'Success',
															results: transaction
														}, callback);
							
													}).catch((error) => {
														lr.issueError(error, 500, event, error, callback);
													});
										
												}).catch((error) => {
													lr.issueError(error, 500, event, error, callback);
												});
											
											}).catch((error) => {
												lr.issueError(error, 500, event, error, callback);
											});
											
										}else{
											
											//note, let's confirm that this makes sense
											lr.issueResponse(200, {
												message: 'Failed',
												results: processor_response
											}, callback);
											
										}
									
									}).catch((error) => {
										lr.issueError(error, 500, event, error, callback);
									});									
							
								}).catch((error) => {
									lr.issueError(error, 500, event, error, callback);
								});
						
							}).catch((error) => {
								lr.issueError(error, 500, event, error, callback);
							});
				
						}).catch((error) => {
							lr.issueError(error, 500, event, error, callback);
						});
						*/