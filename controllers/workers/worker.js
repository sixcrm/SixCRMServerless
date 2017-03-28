'use strict';
const Validator = require('jsonschema').Validator;
var _ = require("underscore");

var rebillController = require('../../controllers/Rebill.js');
var sessionController = require('../../controllers/Session.js');

module.exports = class workerController {
	
	constructor(){
	
	}
	
	parseInputEvent(event){
		
		return new Promise((resolve, reject) => {
			
			if(_.isObject(event)){
				
				//object of structure {id:"blah-blah"}
				if(_.has(event, 'id')){
				
					//useful for local success_event.json inclusion
					resolve(event.id);
				
				//object of structure {... Body:'{\n  "id": "55c103b4-670a-439e-98d4-5a2834bb5fc3"\n}'}	
				//This is normally what's going to be coming back from SQS
				}else if(_.has(event, "Body")){
				
					try{
					
						var parsed_event = JSON.parse(event.Body);
						if(_.has(parsed_event, 'id')){
							resolve(parsed_event.id);
						}
						
					}catch(error){
						reject(error);
					}
				
				//if, somehow the function was passed a raw id 'blah-blah'	
				}else{
				
					//might be garbage...
					resolve(event);
					
				}
			
			// if event is '{"id":"blah-blah"}'	
			}else if(_.isString(event)){
				
				try{
					var parsed_event = JSON.parse(event);
					if(_.has(parsed_event, 'id')){
						resolve(parsed_event.id);
					}
					
				}catch(error){
					reject(error);
				}
				
			}else{
				
				reject(new Error('Unrecognized event format: '+event));
				
			}
			
		});
		
	}
	
	createForwardMessage(event){
		return new Promise((resolve, reject) => {
			this.parseInputEvent(event).then((id) => {
				resolve(JSON.stringify({id:id}));
			}).catch((error) => {
				reject(error);
			});
		});
	}
	
	acquireRebill(event){
		
		return new Promise((resolve, reject) => {
			
			this.parseInputEvent(event).then((id) => {
				
				//let's add a hydration method here...
				rebillController.get(id).then((rebill) => {
					
					this.validateRebill(rebill).then((rebill) => {
						
						resolve(rebill);
					
					}).catch((error) => {
						reject(error);
					});
					
				}).catch((error) => {
					reject(error);
				});
			
			}).catch((error) => {
				reject(error);
			});
			
		});
		
	}	
	
	acquireSession(event){

		return new Promise((resolve, reject) => {
			
			this.parseInputEvent(event).then((id) => {
				//let's add a hydration method here...
				sessionController.get(id).then((session) => {
				
					this.validateSession(session).then((session) => {
						resolve(session);
					}).catch((error) => {
						reject(error);
					});
					
				}).catch((error) => {
					reject(error);
				});
			
			}).catch((error) => {
				reject(error);
			});
			
		});
		
	}	
	
	validateRebill(rebill){

		return new Promise((resolve, reject) => {
			
			try{

				var rebill_schema = require('../../model/rebill.json');

			} catch(e){
		
				reject(new Error('Unable to load validation schemas.'));

			}
	
			var validation;

			try{
				var v = new Validator();
				validation = v.validate(rebill, rebill_schema);
			}catch(e){
				reject(e.message);
			}
		
			if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){
				
				var error = {
					message: 'One or more validation errors occurred.',
					issues: validation.errors.map((e) => { return e.message; })
				};
		
				reject(new Error(error.message));

			}
			
			resolve(rebill);
			
		});
		
	}
	
	validateSession(session){

		return new Promise((resolve, reject) => {
			
			try{

				var session_schema = require('../../model/session.json');

			} catch(e){
		
				reject(new Error('Unable to load validation schemas.'));

			}
	
			var validation;

			try{
				var v = new Validator();
				validation = v.validate(session, session_schema);
			}catch(e){
				reject(e);
			}
		
			if(_.has(validation, "errors") && _.isArray(validation.errors) && validation.errors.length > 0){
				
				var error = {
					message: 'One or more validation errors occurred.',
					issues: validation.errors.map((e) => { return e.message; })
				};
		
				reject(error);

			}
			 
			resolve(session);
			
		});
		
	}
	
}