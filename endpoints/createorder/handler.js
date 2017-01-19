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
if(process.env.stage == 'local'){
	dynamodb = new AWS.DynamoDB.DocumentClient({region: 'localhost', endpoint:process.env.dynamo_endpoint});
}else{
	var dynamodb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});
}

var lr = require('../../lib/lambda-response.js');
var timestamp = require('../../lib/timestamp.js');

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
		return lr.issueError('Unable to load validation schemas.', 500, event, e, callback);	
	}
			
	var validation;
	try{
		var v = new Validator();
		validation = v.validate(duplicate_body, orderjson);
	}catch(e){
		return lr.issueError('Unable to create validation class.', 500, event, e, callback);
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
	
		return lr.issueError('One or more validation errors occurred.', 500, event, new Error({'validation_errors':validation['errors']}), callback);		
		
	}

	getSession(duplicate_body['session_id'], (error, session) => {
			
		if(_.isError(error)){
			return lr.issueError(error, 500, event, error, callback);	
		}	

		getCustomer(session.customer, (error, customer) => {
			
			if(_.isError(error)){
				return lr.issueError(error, 500, event, error, callback);	
			}
			
			if(!_.has(customer, 'creditcards') || !_.isArray(customer.creditcards)){
				//throw big error baby
				//why do we care?
			}	
				
				
			var creditcard = createCreditCardObject(duplicate_body);
			
			storeCreditCard(creditcard, customer.creditcards, (error, creditcard) => {
				
				if(_.isError(error)){
					return lr.issueError(error, 500, event, error, callback);	
				}

				getProducts(duplicate_body['products'], (error, products) => {
					
					if(_.isError(error)){
						return lr.issueError(error, 500, event, error, callback);	
					}
					
					validateProductsSession(products, session, (error, session) => {
						
						if(_.isError(error)){
							return lr.issueError(error, 500, event, error, callback);	
						}
						
						var amount = productSum(products);
						
						processNMITransaction({customer: customer, creditcard: creditcard, amount: amount}, (error, processor_response) => {
						
							if(_.isError(error)){
								return lr.issueError(error, 500, event, error, callback);	
							}
							
							console.log({session: session, products: products, amount: amount});
							
							putTransaction({session: session, products: products, amount: amount}, processor_response, (error, transaction) => {
							
								if(_.isError(error)){
									return lr.issueError(error, 500, event, error, callback);	
								}
								
								console.log('products');
								console.log(products);
								
								console.log('session');
								console.log(session);
									
								updateSession(session, products, (error, session) => {
									
									console.log('products');
									console.log(products);
								
									console.log('session');
									console.log(session);
									
									if(_.isError(error)){
										return lr.issueError(error, 500, event, error, callback);	
									}	
									
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
			
		});
		
	});
			
};

var updateSession =  function(session, products, callback){
	
	var products = getProductIds(products);
	
	var session_products = session.products;
	
	if(_.isArray(session.products) && session.products.length > 0){
	
		var updated_products = session_products.concat(products);
		
	}else{
		
		var updated_products = products;
		
	}
	
	var modified = timestamp.createTimestampSeconds();
	
	updateRecord(process.env.sessions_table, {'id': session.id}, 'set products = :a, modified = :m', {":a": updated_products, ":m": modified.toString()}, (error, data) => {
		
		if(_.isError(error)){
		
			return callback(error, error.stack);
			
		}else{
		
			session.products = updated_products;
		
			return callback(null, session);
			
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
	//missing session
	console.log('put transaction params');
	console.log(params);
	var transaction = createTransactionObject(params, processor_response);

	console.log('created transaction');
	console.log(transaction);
	saveRecord(process.env.transactions_table, transaction, (error, data) => {
		if(_.isError(error)){
			return callback(error, null);
		}
		
		return callback(null, transaction);
		
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

	var transaction_products = [];
    if(_.has(params.session, "products") && _.isArray(params.session.products)){
        transaction_products = params.session.products;

    }

	var return_object = {
		id: uuidV4(),
		parentsession: params.session.id,
		products: transaction_products,
		processor_response: JSON.stringify(processor_response),
		amount: params.amount,
		date: timestamp.createDate()
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
		
		if(_.isError(error)){ return callback(error, null);}
		
		if(!_.isEqual(products_array.length, products.length)){
		
			return callback(new Error('Unrecognized products in products list.'), null);

		}
		
		return callback(null, products);
		
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

	console.log('parameters');
	console.log(parameters);
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
	if(_.has(parameters.creditcard.address, "line2")){
		return_object.address2 = parameters.creditcard.address.line2;
	}
	
	//shipping address
	return_object.shipping_address1 = parameters.customer.address.line1;
	return_object.shipping_city = parameters.customer.address.city;
	return_object.shipping_state = parameters.customer.address.state;
	return_object.shipping_zip = parameters.customer.address.zip;
	return_object.shipping_country = parameters.customer.address.country;
	if(_.has(parameters.customer.address, "line2")){
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
			return callback(
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
					
					return callback(null, {
						message: 'Success',
						results: response_body
					});
					
					break;
	
				case '2':

					return callback(null, {
						message: 'Declined',
						results:  response_body
					});
					
					break;
	
				case '3':
				default:

					return callback(
						new Error('Unsuccessful to post to NMI'), 
						{
							message: 'Error',
							results: response_body
						});

					break;
		
			}

		}else{				

			return callback(
				new Error('Unexpected Error posting to NMI.'), 
				{
					message: 'Error',
					results: null
				});
				
		}
		
	});
	
}

//what does this duuuuuu?
var storeCreditCard = function(creditcard, creditcards, callback){
	
	var stored_card;
	
	if(_.isArray(creditcards) && creditcards.length > 0){
		
		for(var i= 0; i< creditcards.length; i++){
			
			if(_.isEqual(creditcard.ccnumber, creditcards[i].ccnumber)){
				
				if(_.isEqual(creditcard.expiration, creditcards[i].expiration)){
					
					if(_.isEqual(creditcard.ccv, creditcards[i].ccv)){
						
						if(_.isEqual(creditcard.name, creditcards[i].name)){
						
							return callback(creditcards[i]);
						
						}
					
					}
					
				}
				
			}
					
		}
	
	}
		
	putCreditCard(creditcard, (error, stored_card) => {
		
		if(_.isError(error)){
			
			return callback(error, null);
			
		}	
		
		return callback(null, stored_card);
			
	});
	
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
	
	getRecords(process.env.creditcards_table, 'ccnumber = :ccnumberv', {':ccnumberv': creditcard.ccnumber}, 'ccnumber-index', (error, creditcards) => {
		
		if(_.isError(error)){ return callback(error, null);}
		
		var card_identified = false;
		creditcards.forEach(function(item){
			if(isSameCreditCard(creditcard, item)){
				card_identified = true;
				return callback(null, item);
			}
		});
		
		//note need to save the credit card information here
		if(card_identified == false){

			saveCreditCard(creditcard, (error, data) => {
				
				if(_.isError(error)){ return callback(error, null);}
		
				return callback(null, data);
		
			});
			
		}
		
	});
	
}

var saveCreditCard = function(creditcard, callback){
	
	if(!_.has(creditcard, 'id')){
		creditcard.id = uuidV4();
	}
	
	saveRecord(process.env.creditcards_table, creditcard, (error, data) => {
		
		if(_.isError(error)){
			return callback(error, null);
		}
		
		return callback(null, creditcard);
		
	});
	
}

var getCreditCard = function(id, callback){

	getRecord(process.env.creditcards_table, 'id = :idv', {':idv': id}, null, (error, data) => {
		
		if(_.isError(error)){ return callback(error, null);}
		
		return callback(null, data);
		
	});	
	
}

var getSession = function(id, callback){
	
	getRecord(process.env.sessions_table, 'id = :idv', {':idv': id}, null, (error, session) => {
		
		if(_.isError(error)){ return callback(error, null); }
		
		if(_.has(session, "customer")){
			
			if(_.has(session, 'completed')){
			
				if(_.isEqual(session.completed, 'false')){
				
					return callback(null, session);
				
				}else{
			
					return callback(new Error('The session has already been completed.'), null);
				
				}
				
			}else{
				
				return callback(new Error('Session missing completed key.', null));
				
			}
			
		}else{
			
			//note that this also occurs when nothing matches the session in the query
			return callback(new Error('Session missing customer key.', null));
			
		}	
		
	});	
	
}

var getCustomer = function(id, callback){
	
	getRecord(process.env.customers_table, 'id = :idv', {':idv': id}, null, (error, data) => {

		if(_.isError(error)){ return callback(error, null);}
		
		return callback(null, data);
		
	});	
	
}

//this doesn't need to be asynchronous
var validateProductsSession =  function(products, session, callback){
	
	if(!_.has(session, 'products') || !_.isArray(session.products) || session.products.length < 1){
		
		return callback(null, session);
	}
	
	for(var i = 0; i < products.length; i++){
		var product_id = products[i].id;
		for(var j = 0; j < session.products.length; j++){
			if(_.isEqual(product_id, session.products[j])){
				
				return callback(new Error('Product already belongs to this session'), null);
			}
		}
	}

	return callback(null, session);

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
			return callback(err, err.stack);
		}
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
			
			if(data.Items.length == 1){
				
				return callback(null, data.Items[0]);
				
			}else{
				
				return callback(null, data.Items);
				
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
			return callback(err, err.stack);
		}
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
			return callback(null, data.Items);
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
			return callback(err, err.stack);
		}
		
		if(_.isObject(data) && _.has(data, "Items") && _.isArray(data.Items)){
			return callback(null, data.Items);
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
	  	return callback(err, err.stack);
	  }
	  return callback(null, data);
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
	  	 return callback(err, err.stack); 
	  }else{     
	  	return callback(null, data);           
	  }
	});

}