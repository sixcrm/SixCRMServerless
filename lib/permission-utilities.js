'use strict'
const _ =  require('underscore');
const du = require('./debug-utilities.js');

class PermissionUtilities {
	
	constructor(){
		this.messages = {
			nopermission: 'Sorry, you don\'t have access to this Entity type.'
		}
		this.universalpermissions = ['role/read'];
	}
	
	validatePermissions(action, entity){
		
		return new Promise((resolve, reject) => {
			
			if(_.has(global, 'disableactionchecks') && global.disableactionchecks == true){
				
				du.warning('USER ACL actionchecks disabled.');
				
				return resolve(true);
				
			}else{
			
				let permission_string = this.buildPermissionString(action, entity);
				
				du.debug('Permission String: '+permission_string);
				
				this.getPermissions().then((permissions) => {	
					
					du.debug('Permissions:', permissions);
					
					let has_permission = this.hasPermission(permission_string, permissions.allow);
					
					du.debug('Has Permission: '+has_permission);
					
					return resolve(has_permission);

				}).catch((error) => {

					return reject(error);
			
				});
			
			}
			
		});
		
	}
	
	getPermissions(){
		
		return new Promise((resolve, reject) => {
			
			du.debug('Global User:', global.user, 'Global Account: ', global.account);
			
			if(!_.has(global, 'user') || _.isNull(global.user) || !_.has(global, 'account') || _.isNull(global.account)){
				
				return reject(new Error('Missing request parameters'));
			
			}else{
				 
				du.debug('Global User: ', global.user);
				du.debug('Global Account: ', global.account);
				
				let permission_object = this.buildPermissionObject();
				
				du.debug('Permission Object: ', permission_object);
				
				resolve(permission_object);
				
			}
		
		});
		
	}
	
	buildPermissionObject(){
		
		du.debug('Build Permission Object');
		
		let allow = [];
		let deny = ['*'];
		
		if(_.has(global, 'user') && _.has(global.user, 'acl')){
		 	
		 	if(_.isArray(global.user.acl)){
		
				global.user.acl.forEach((acl_object) => {
				
					du.highlight(acl_object);
				
					if(_.has(acl_object, 'account') && _.has(acl_object.account, 'id')){
				
						du.debug('ACL OBJECT: ', acl_object);
				
						if(acl_object.account.id == '*' || acl_object.account.id == global.account){
				
							if(_.has(acl_object, 'role') && _.has(acl_object.role, 'permissions') && _.has(acl_object.role.permissions, 'allow') && _.isArray(acl_object.role.permissions.allow)){
								if(acl_object.role.permissions.allow.length > 0){
									allow = allow.concat(acl_object.role.permissions.allow);
								}
							}else{
								throw new Error('Unexpected ACL object structure');
							}
					
							if(_.has(acl_object, 'role') && _.has(acl_object.role, 'permissions') && _.has(acl_object.role.permissions, 'deny') && _.isArray(acl_object.role.permissions.deny)){
								if(acl_object.role.permissions.deny.length > 0){
									deny = deny.concat(acl_object.role.permissions.deny);
								}
							}
					
						}	
			
					}else{
			
						throw new Error('Unset ACL Account');
				
					}
			
				});
			
			}
			
		}
		
		allow = _.uniq(allow);
		deny = _.uniq(deny);

		return {allow:allow, deny:['*']};
		
	}
	
	buildPermissionString(action, entity){
	
		let permission_string = entity+'/'+action;
		
		return permission_string;
		
	}
	
	hasPermission(permission_string, permission_array){
		
		let return_value = false;

		if(_.contains(this.universalpermissions, permission_string)){
			
			return_value = true;
				
		}else{
		
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
		
		}
		
		return return_value;
		
	}
	
	validatePermissionsArray(permissions_array){
		
		du.debug('Validate Permissions Array');
		
		du.highlight(permissions_array);
		
		return new Promise((resolve, reject) => {
		
			this.getPermissions().then((permissions) => {	
				
				let permission_object = {
					has_permission: false,
					permission_failures: []
				};
							
				let permission_failures = [];
				
				permissions_array.forEach((permission_string) => {
					
					if(!this.hasPermission(permission_string, permissions.allow)){
						
						permission_failures.push(permission_string);
								
					}
					
				});
				
				if(permission_failures.length < 1){ permission_object['has_permission'] = true; }
				
				permission_object['permission_failures'] = permission_failures;
					
				return resolve(permission_object);

			}).catch((error) => {

				return reject(error);
	
			});
			
		});
		
	}
	
	setGlobalAccount(account){
		
		du.debug('Set Global Account');

		global.account = account;
			
	}
	
	unsetGlobalAccount(){
		
		du.debug('Unset Global Account');

		global.account = undefined;
			
	}
	
	unsetGlobalUser(){
		
		du.debug('Unset Global User.');
		
		global.user = undefined;
		
	}
	
	setGlobalUser(user){
	
		du.debug('Set Global User');
						
		global.user = user;
							
	}
	
	disableACLs(){
		
		du.warning('Disable ACLs');
		
		global.disableactionchecks = true;
		global.disableaccountfilter = true;
			
	}
	
	enableACLs(){
		
		du.warning('Enable ACLs');
		
		global.disableactionchecks = false;
		global.disableaccountfilter = false;
			
	}
		
}

var pu = new PermissionUtilities();
module.exports = pu;