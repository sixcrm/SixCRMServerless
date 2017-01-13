'use strict'
var _ =  require('underscore');

class SessionHelper {
	
	constructor(){
	
	}
	
	getSession(id, callback){
	
		getRecord(process.env.sessions_table, 'id = :idv', {':idv': id}, null, (error, session) => {
			
			if(_.isError(error)){ return callback(error, null); }
		
			if(_.has(session, "customer") && _.has(session, 'completed')){
		
				if(_.isEqual(session.completed, 'false')){
				
					return callback(null, session);
				
				}else{
			
					return callback(new Error('The session has already been completed.'), null);
				
				}
			
			}else{
		
				return callback(new Error('An unexpected error occured', null));
			
			}	
		
		});	
	
	}
	
	updateSession(session, products, callback){
	
		var products = getProductIds(products);
	
		var session_products = session.products;
	
		if(_.isArray(session.products) && session.products.length > 0){
	
			var updated_products = session_products.concat(products);
		
		}else{
		
			var updated_products = products;
		
		}
	
		var modified = createTimestamp();
	
		updateRecord(process.env.sessions_table, {'id': session.id}, 'set products = :a, modified = :m', {":a": updated_products, ":m": modified.toString()}, (error, data) => {
		
			if(_.isError(error)){
		
				return callback(error, error.stack);
			
			}else{
		
				session.products = updated_products;
		
				return callback(null, session);
			
			}
		
		});
	
	}
	
	issueError(message, code, event, error, callback){
		
		if(_.isError(message)){
			message = message.message;
		}
		
		if(_.isError(error)){
			this.issueResponse(code, {
				message: message,
				event: event,
				error: error.message
			}, callback);

		}
	}
	
	issueResponse(code, body, callback)	{
	
		this.lambda_response.statusCode = code;
		this.lambda_response.body = JSON.stringify(body);
		
		return callback(null, this.lambda_response)
		
	}	
}

module.exports = Session;