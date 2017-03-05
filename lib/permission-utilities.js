'use strict'
var _ =  require('underscore');

class PermissionUtilities {
	
	constructor(){
		this.messages = {
			nopermission: 'Sorry, you don\'t have access to this Entity type.'
		}
	}
	
	validatePermissions(action, entity){

		return new Promise((resolve, reject) => {
			
			if(_.has(global, 'disableactionchecks') && global.disableactionchecks == true){

				resolve(true);
				
			}
			
			let permission_string = this.buildPermissionString(action, entity);
			
			this.getPermissions().then((permissions) => {	
			
				let has_permission = this.hasPermission(permission_string, permissions.allow);

				return resolve(has_permission);

			}).catch((error) => {

				return reject(error);
			
			});
			
		});
		
	}
	
	getPermissions(){
	
		console.log('getPermissions');
		
		return new Promise((resolve, reject) => {
			
			if(!_.has(global, 'user') || !_.has(global, 'account')){
				
				return reject(new Error('Missing request parameters'));
			
			}
			
			let role;

			if(_.has(global.user, 'acl')){
			
				global.user.acl.forEach((acl_object) => {
					
					if(_.has(acl_object, 'account') && _.has(acl_object.account, 'id')){
						
						if(acl_object.account.id == '*'){
							return resolve(acl_object.role.permissions);
						}						
						
						if(acl_object.account.id == global.account){
							return resolve(acl_object.role.permissions);
						}
					
					}
				
				});
				
			}
			
			return resolve({allow:[], deny:['*']});
		
		});
		
	}
	
	buildPermissionString(action, entity){

		let permission_string = entity+'/'+action;

		return permission_string;
		
	}
	
	hasPermission(permission_string, permission_array){
		
		let return_value = false;
		
		permission_array.forEach((permission) => {
			
			//has access to everything	
			if(permission == '*'){
				return_value = true;
				return true;
			}
			
			//permission string is exact match 
			if(permission == permission_string){
				return_value = true;
				return true;
			}
			
			//permission string has access to everything in entity
			var permission_string_array = permission_string.split('/');
			
			if(permission_string_array.length == 2){
			
				let defined_permission = permission.split('/');
				
				if(defined_permission[0] == permission_string_array[0]){
					
					if(defined_permission[1] == '*'){ 
					
						return_value = true;
						return true;
					
					}
				
				}
				
			}
		
		});
		
		return return_value;
		
	}
		
}

var pu = new PermissionUtilities();
module.exports = pu;