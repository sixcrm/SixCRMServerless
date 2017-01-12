'use strict';
const _ = require("underscore");
const fs = require('fs');
const validator = require('validator');
const Validator = require('jsonschema').Validator;
const v = new Validator();
const request = require('request');
const querystring = require('querystring');
const AWS = require("aws-sdk");
const uuidV4 = require('uuid/v4');
var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
if(_.isString(process.env.dynamo_endpoint) && !_.isEmpty(process.env.dynamo_endpoint)){
	dynamodb = new AWS.DynamoDB.DocumentClient({region: 'localhost', endpoint:'http://localhost:8001'});
}

var lr = require('../../lib/lambda-response.js');

module.exports.createorder= (event, context, callback) => {

	var duplicate_body;
	try {
    	duplicate_body = JSON.parse(event['body']);
	} catch (e) {
		duplicate_body = event.body;
	}
		
	var orderjson;
	try{
		orderjson = JSON.parse(fs.readFileSync('./endpoints/createorder/schema/order.json','utf8'));
	} catch(e){
		lr.issueError('Unable to load validation schemas.', 500, event, e, callback);	
	}
			
	var validation;
	try{
		var v = new Validator();
		validation = v.validate(duplicate_body, orderjson);
	}catch(e){
		lr.issueError('Unable to create validation class.', 500, event, e, callback);
	}
	
	if(validation['errors'].length > 0){	
		lr.issueError('One or more validation errors occurred.', 500, event, new Error(JSON.stringify({'validation_errors':validation['errors']})), callback);
	}
	
	if(_.has(duplicate_body, 'email') && !validator.isEmail(duplicate_body['email'])){
		validation.errors.push('"email" field must be a email address.');
	}
	
	if(_.has(duplicate_body, 'shipping_email') && !validator.isEmail(duplicate_body['shipping_email'])){
		validation.errors.push('"shipping_email" field must be a email address.');
	}
	
	if(_.has(duplicate_body, 'ccnumber') && !validator.isCreditCard(duplicate_body['ccnumber'])){
		
		if(process.env.stage == 'production'){
			validation.errors.push('"ccnumber" must be a credit card number.');
		}
		
	}
	
	if(_.has(duplicate_body, 'shipping') && !validator.isCurrency(duplicate_body['shipping'])){
		validation.errors.push('"shipping" must be a currency amount.');
	}
	
	if(_.has(duplicate_body, 'tax') && !validator.isCurrency(duplicate_body['tax'])){
		validation.errors.push('"tax" must be a currency amount.');
	}
	
	if(validation['errors'].length > 0){
	
		lr.issueError('One or more validation errors occurred.', 500, event, new Error({'validation_errors':validation['errors']}), callback);		
	}
	
	
	getSession(duplicate_body['session_id'], (error, session) => {
			
		lr.issueError(error, 500, event, error, callback);		
	
		getCustomer(session.customer, (error, customer) => {
			
			lr.issueError(error, 500, event, error, callback);
			
			if(_.has(customer, 'creditcards') && _.isArray(customer.creditcards)){
				
				var creditcard = createCreditCardObject(duplicate_body);
				
				storeCreditCard(creditcard, customer.creditcards, (error, creditcard) => {
					
					lr.issueError(error, 500, event, error, callback);
					
					getProducts(duplicate_body['products'], (error, products) => {
						
						lr.issueError(error, 500, event, error, callback);					
								
						validateProductsSession(products, session, (error, session) => {
							
							lr.issueError(error, 500, event, error, callback);	
							
							var amount = productSum(products);
						
							processNMITransaction({customer: customer, creditcard: creditcard, amount: amount}, (error, processor_response) => {
							
								lr.issueError(error, 500, event, error, callback);
														
								putTransaction({session: session, products: products, amount: amount}, processor_response, (error, transaction) => {
								
									lr.issueError(error, 500, event, error, callback);
									
									updateSession(session, products, (error, session) => {
										
										lr.issueError(error, 500, event, error, callback);
										
										transaction.products = session.products;
										
										lr.issueResponse(200, {
											message: 'Success',
											results: transaction
										}, callback);
									
									});
									
								
								});
						
							});
							
						});
						
					});
					
				});
				
			}
			
		});
		
	});
			
};

var updateSession =  function(session, products, callback){
	
	var products = getProductIds(products);
	
	var session_products = session.products;
	
	var updated_products = session_products.concat(products);
	
	updateRecord(process.env.sessions_table, {'id': session.id}, 'set products = :a', {":a": updated_products}, (error, data) => {
		
		if(_.isError(error)){
		
			callback(error, error.stack);
			
		}else{
		
			session.products = updated_products;
		
			callback(null, session);
			
		}
		
	});
	
}


var productSum = function(products){
		
	var return_amount = 0;
	for(var i = 0; i < products.length; i++){
		return_amount += products[i].prices[products[i].type];
	}
	return parseFloat(return_amount);

}

var putTransaction = function(params, processor_response, callback){
	
	var transaction = createTransactionObject(params, processor_response);
	
	saveRecord(process.env.transactions_table, transaction, (error, data) => {
	
		if(_.isError(error)){
			callback(error, null);
		}
		
		callback(null, transaction);
		
	});
	
}

var getProductIds = function(products){
	
	var return_array = [];
	for(var i = 0; i < products.length; i++){
		return_array.push(products[i].id);
	}
	return return_array;
}

var createTransactionObject = function(params, processor_response){

	var product_ids = getProductIds(params.products);
	
	var return_object = {
		id: uuidV4(),
		session: params.session.id,
		products: params.session.products,
		processor_response: processor_response,
		amount: params.amount,
		date: timestampToDate(createTimestamp())
	}
	
	return return_object;
}

var getProducts = function(products_array, callback){
	
	var products_object = {};
	var index = 0;
	products_array.forEach(function(value) {
		index++;
		var product_key = ":productvalue"+index;
		products_object[product_key.toString()] = value;
	});
	
	scanRecords(process.env.products_table, "id IN ("+Object.keys(products_object).toString()+ ")", products_object, (error, products) => {
		
		if(_.isError(error)){ callback(error, null);}
		
		if(!_.isEqual(products_array.length, products.length)){
		
			callback(new Error('Unrecognized products in products list.'), null);
		}
		
		callback(null, products);
		
	});
	
}

var createCreditCardObject = function(request_body){
	
	var creditcard = {
		ccnumber: request_body.ccnumber,
		expiration: request_body.ccexpiration,
		ccv: request_body.ccccv,
		name: request_body.name,
		address: request_body.address
	};
	
	return creditcard;
	
}

var createParameterGroup = function(parameters){
	
	var return_object = {};
	
	//authentication
	return_object.username = process.env.nmi_username;
	return_object.password = process.env.nmi_password;
	
	//operation type
	return_object.type = 'sale';
	
	//personal
	return_object.firstname = parameters.customer.firstname;
	return_object.lastname = parameters.customer.lastname;
	
	//creditcard
	return_object.ccnumber = parameters.creditcard.ccnumber;
	return_object.ccexp = parameters.creditcard.expiration;
	return_object.ccv = parameters.creditcard.ccv;
	return_object.amount = parameters.amount;
	
	//billing address
	return_object.address1 = parameters.creditcard.address.line1;
	return_object.city = parameters.creditcard.address.city;
	return_object.state = parameters.creditcard.address.state;
	return_object.zip = parameters.creditcard.address.zip;
	return_object.country = parameters.creditcard.address.country;
	if(_.has(parameters.creditcard.address.line2)){
		return_object.address2 = parameters.creditcard.address.line2;
	}
	
	//shipping address
	return_object.shipping_address1 = parameters.customer.address.line1;
	return_object.shipping_city = parameters.customer.address.city;
	return_object.shipping_state = parameters.customer.address.state;
	return_object.shipping_zip = parameters.customer.address.zip;
	return_object.shipping_country = parameters.customer.address.country;
	if(_.has(parameters.creditcard.address.line2)){
		return_object.shipping_address2 = parameters.customer.address.line2;
	}
	
	return return_object;
	
}

var processNMITransaction = function(parameters_array, callback){
	
	var parameter_group = createParameterGroup(parameters_array);
	
	var request_options = {
	  headers: {'content-type' : 'application/x-www-form-urlencoded'},
	  url:     process.env.nmi_endpoint,
	  body:    querystring.stringify(parameter_group)
	};

	request.post(request_options, (error, response, body) => {
		
		if(_.isError(error)){
			callback(
				error, 
				{
					message: 'Error',
					results: null
				});	
		}

		var response_body = querystring.parse(body);
		
		if(_.isObject(response_body) && _.has(response_body, "response")){

			switch(response_body.response){

				case '1':
					
					callback(null, {
						message: 'Success',
						results: response_body
					});
					
					break;
	
				case '2':

					callback(null, {
						message: 'Declined',
						results:  response_body
					});
					
					break;
	
				case '3':
				default:

					callback(
						new Error('Unsuccessful to post to NMI'), 
						{
							message: 'Error',
							results: response_body
						});

					break;
		
			}

		}else{				

			callback(
				new Error('Unexpected Error posting to NMI.'), 
				{
					message: 'Error',
					results: null
				});
				
		}
		
	});
	
}

var storeCreditCard = function(creditcard, creditcards, callback){
	
	var stored_card;
	
	if(_.isArray(creditcards) && creditcards.length > 0){
		
		for(var i= 0; i< creditcards.length; i++){
			
			if(_.isEqual(creditcard.number, creditcards[i].number)){
				
				if(_.isEqual(creditcard.expiration, creditcards[i].expiration)){
					
					if(_.isEqual(creditcard.ccv, creditcards[i].ccv)){
						
						if(_.isEqual(creditcard.name, creditcards[i].name)){
						
							stored_card = creditcards[i];
							
							return;
						
						}
					
					}
					
				}
				
			}
					
		}
	
	}
	
	if(!_.isObject(stored_card)){
		
		putCreditCard(creditcard, (error, stored_card) => {
			
			if(_.isError(error)){
				
				callback(error, null);
				
			}	
			
			callback(null, stored_card);
				
		});
			
	}else{
	
		callback(null, stored_card);
		
	}
	
}

var isSameCreditCard = function(creditcard1, creditcard2){
	
	if(!_.isEqual(creditcard1.ccv, creditcard2.ccv)){
		return false;
	}
	
	if(!_.isEqual(creditcard1.ccnumber, creditcard2.ccnumber)){
		return false;
	}
	
	if(!_.isEqual(creditcard1.expiration, creditcard2.expiration)){
		return false;
	}
	
	if(!_.isEqual(creditcard1.address, creditcard2.address)){

		return false;
	}
	
	return true;
}

var putCreditCard =  function(creditcard, callback){
	
	getRecords(process.env.creditcards_table, 'ccnumber = :ccnumberv', {':ccnumberv': creditcard.ccnumber}, 'ccnumber-index', (error, data) => {
		
		if(_.isError(error)){ callback(error, null);}
		
		var card_identified = false;
		data.forEach(function(item){
			if(isSameCreditCard(creditcard, item)){
				card_identified = true;
				callback(null, item);
			}
		});
		
		//note need to save the credit card information here
		if(card_identified == false){

			saveSession(customer_id, (error, data) => {
			
				if(_.isError(error)){ callback(error, null);}
		
				callback(null, data);
		
			});
			
		}
		
	});
	
}

var getCreditCard = function(id, callback){

	getRecord(process.env.creditcards_table, 'id = :idv', {':idv': id}, null, (error, data) => {
		
		if(_.isError(error)){ callback(error, null);}
		
		callback(null, data);
		
	});	
	
}

var getSession = function(id, callback){

	getRecord(process.env.sessions_table, 'id = :idv', {':idv': id}, null, (error, session) => {
				
		if(_.isError(error)){ callback(error, null); }
		
		if(_.has(session, "customer") && _.has(session, 'completed')){
		
			if(_.isEqual(session.completed, 'false')){
				
				callback(null, session);
				
			}else{
			
				callback(new Error('The session has already been completed.'), null);
				
			}
			
		}else{
		
			callback(new Error('An unexpected error occured', null));
			
		}	
		
	});	
	
}

var getCustomer = function(id, callback){
	
	getRecord(process.env.customers_table, 'id = :idv', {':idv': id}, null, (error, data) => {

		if(_.isError(error)){ callback(error, null);}
		
		callback(null, data);
		
	});	
	
}

var validateProductsSession =  function(products, session, callback){

	var validated = true;
	for(var i = 0; i < products.length; i++){
		var product_id = products[i].id;
		for(var j = 0; j < session.products.length; j++){
			if(_.isEqual(product_id, session.products[j])){
				callback(new Error('Product already belongs to this session'), null);
				validated = false;
			}
		}
	}
	
	if(validated == true){
		callback(null, session);
	}

}

var getRecord = function(table, condition_expression, parameters, index, callback){
	
	var params = {
		TableName: table,
		IndexName: index,
		KeyConditionExpression: condition_expression,
		ExpressionAttributeValues: parameters
	};
	
	dynamodb.query(params, function(err, data) {
		if(_.isError(err)){
			console.log(err.stack);
			callback(err, err.stack);
		}
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
			
			if(data.Items.length == 1){
				
				callback(null, data.Items[0]);
				
			}else{
				
				callback(null, data.Items);
				
			}
			
		}
		
	});
	
}

var getRecords = function(table, condition_expression, parameters, index, callback){
	
	var params = {
		TableName: table,
		IndexName: index,
		KeyConditionExpression: condition_expression,
		ExpressionAttributeValues: parameters
	};
	
	dynamodb.query(params, function(err, data) {
		if(_.isError(err)){
			console.log(err.stack);
			callback(err, err.stack);
		}
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
			callback(null, data.Items);
		}
		
	});
	
}

var scanRecords = function(table, scan_expression, parameters, callback){
	
	var params = {
		TableName: table,
		FilterExpression: scan_expression,
		ExpressionAttributeValues: parameters
	};
	
	dynamodb.scan(params, function(err, data) {
		if(_.isError(err)){
			console.log(err.stack);
			callback(err, err.stack);
		}
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
			callback(null, data.Items);
		}
		
	});
	
}

var saveRecord = function(table, item, callback){
	
	var params = {
		TableName:table,
		Item:item
	};
	
	dynamodb.put(params, function(err, data) {
	  if(_.isError(err)){
	  	callback(err, err.stack);
	  }
	  callback(null, data);
	});
	
}

var updateRecord = function(table, key, expression, expression_params, callback){
	
	var params = {
		TableName:table,
		Key: key,
		UpdateExpression: expression,
		ExpressionAttributeValues:expression_params,
		ReturnValues:"UPDATED_NEW"
	};
	
	dynamodb.update(params, function(err, data) {
	  if (err){
	  	 callback(err, err.stack); 
	  }else{     
	  	callback(null, data);           
	  }
	});

}

var createTimestamp =  function(){
	return Math.round(new Date().getTime()/1000);
}

var timestampToDate = function(timestamp){
	var date = new Date(timestamp*1000);
	return date.toUTCString();
}

