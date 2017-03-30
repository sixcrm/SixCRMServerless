'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

const du = require('../lib/debug-utilities.js');
const inviteutilities = require('../lib/invite-utilities.js');

const accountController = require('./Account.js');
const roleController = require('./Role.js');
const accessKeyController = require('./AccessKey.js');
const userACLController = require('./UserACL.js');
const entityController = require('./Entity.js');

class userController extends entityController {

	constructor(){
		super(process.env.users_table, 'user');
		this.table_name = process.env.users_table;
		this.descriptive_name = 'user';
	}
	
	//returns a user, false or an error
	getUserStrict(user_string){
	
		return new Promise((resolve, reject) => {
		
			if(this.isEmail(user_string)){
				
				du.debug('Is email: true');
				
				this.disableACLs();
				
				du.debug('Get User');
				
				this.get(user_string).then((user) => {
					
					du.debug('Have user:', user);
					
					//Technical Debt:  This seems like very light validation...
					if(_.has(user, 'id')){
						
						this.getHydrated(user.id).then((user) => {
								
							this.enableACLs();
							
							this.setGlobalUser(user);
						
							return resolve(user);
			
						}).catch((error) => {
								
							du.warning(error);
							
							return reject(error);
				
						});	
						
					}else{
						
						this.unsetGlobalUser();
						
						return resolve(false);
						
					}
					
				}).catch((error) => {
					
					return reject(error);
					
				});
				
			}else{
			
				return reject(new Error('A user identifier or a email is required.'));
				
			}
			
		});
		
	}
	
	introspection(){
		
		du.debug('Introspection');
		
		return new Promise((resolve, reject) => {
			
			if(_.has(global, 'user')){
				
				if(this.isEmail(global.user)){
					
					this.createProfile(global.user).then((user) => {
						
						//Technical Debt:  Let's make sure that it's a appropriate object before we set it as the global user here...
						this.isPartiallyHydratedUser(user).then((validated) => {
							
							if(validated == true){
							
								this.setGlobalUser(user);
						
								du.debug('New Global User:', global.user);
						
								return resolve(this.introspection());
								
							}else{
								
								return reject(new Error('User created in profile is not a partially-hydrated user.'));
								
							}

						});
						
						
					}).catch((error) => {
					
						return reject(error);
						
					});
				
				}else if(_.has(global.user, 'id')){
					
					//Technical Debt: need some vigorous validation here
					du.debug('Global User:', global.user);
				
					return resolve(global.user);
				
				}else{
					
					return reject(new Error('Global User must be of type User or Email.'));
					
				}	
				
			}else{
			
				return reject(new Error('Introspection method requires a global user.'));
				
			}
			
		});
		
	}
	
	createProfile(email){
		
		return new Promise((resolve, reject) => {
		
			this.disableACLs();
			
			this.get(email).then((user) => {
			
				if(_.has(user, 'id')){
				
					return reject(new Error('The user already exists.'));
				
				}else{
					
					let account_id = uuidV4();
			
					let promises = [];
					promises.push(accountController.create({id: account_id,name: email+'-pending-name', active: 'false'}));
					promises.push(this.create({id:email, name:email, active:"false"}));
			
					//Technical Debt:  This should be a lookup, not a hardcoded string
					promises.push(roleController.get('cae614de-ce8a-40b9-8137-3d3bdff78039'));
			
					Promise.all(promises).then((promises) => {
				
						let account = promises[0];
						let user = promises[1];
						let role = promises[2];
				
						if(!_.has(account, 'id') || !_.has(user, 'id') || !_.has(role, 'id')){
							reject(new Error('Unable to create new profile'));
						}
				
						du.debug('User', user);
						du.debug('Role', role);
						du.debug('Account', account);
				
						let acl_object = {
							user: user.id,
							account: account_id,
							role: role.id
						};
				
						du.debug('ACL object to create:', acl_object);
				
						userACLController.create(acl_object).then((acl) => {
					
					
							acl.account = account;
							acl.role = role;
					
							du.debug(acl);
					
							this.enableACLs();
							
							user.acl = [acl];
					
					
							resolve(user);
					
						}).catch((error) => {
					
							du.warning(error);
							reject(error);
					
						});
	
					}).catch((error) => {
				
						reject(error);
				
					});
			
				}
				
			}).catch((error) => {
				
				return reject(error);
				
			});
			
		});
		
	}
	
	getHydrated(id){
		
		var controller_instance = this;
		
		return new Promise((resolve, reject) => {
			
			this.get(id).then((user) => {
				
				du.debug('Prehydrated User:', user);
				
				if(_.has(user, 'id')){
				
					this.getACLPartiallyHydrated(user).then((acl) => {
						
						du.debug('Partially hydrated User ACL object:', acl);
							
						user.acl = acl;
						
						du.debug(this);
						
						this.isPartiallyHydratedUser(user).then((validated) => {
								
							if(validated){
								
								return resolve(user);
									
							}else{
									
								return reject(new Error('The user is not partially hydrated.'));
									
							}
								
						}).error((error) => {
								
							return reject(error);
								
						});
						
					}).catch((error) => {
					
						return reject(error);
						
					});
				
				}else{
					
					return resolve(null);
										
				}
			
			}).catch((error) => {
			
				return reject(error);
				
			});
			
		});
		
	}
	
	getACL(user){
		
		if(_.has(user, 'acl') && _.isArray(user.acl)){
			return user.acl;
		}
		
		return userACLController.getACLByUser(user.id);
		
	}
	
	getACLPartiallyHydrated(user){
		
		return new Promise((resolve, reject) => {
		
			var acls = [];
			
			du.debug('User: ', user.id);
			
			userACLController.listBySecondaryIndex('user', user.id, 'user-index').then((acls) => {
				
				du.debug('ACLs: ', acls);
				
				if(_.isNull(acls)){
					return resolve(null);
				}
				
				du.debug('ACLs: ', acls);
				
				let acl_promises = acls.map(acl => userACLController.getPartiallyHydratedACLObject(acl));
				
				Promise.all(acl_promises).then((acl_promises) => {

					resolve(acl_promises);
					
				}).catch((error) => {

					reject(error);
				});
				
			});
			
		});
		
	}
	
	getAccount(id){
		
		if(id == '*'){ 
			return accountController.getMasterAccount(); 
		}else{
			return accountController.get(id);
		}
		
	}
	
	getAccessKey(id){
	
		du.debug('Get Access Key');
		return accessKeyController.get(id);
		
	}
	
	getAccessKeyByKey(id){
		return accessKeyController.getAccessKeyByKey(id);
	}
	
	getAddress(user){
		
		if(_.has(user, "address")){
			
			return user.address;
			
		}else{
			return null;
		}
		
	}
	
	createStrict(user){
		
		du.debug('Create User Strict');
		du.debug('Arguments:', user);
			
		return new Promise((resolve, reject) => {
			
			du.debug('global user', global.user);
			
			if(_.has(global, 'user') && _.has(global.user, 'id')){

				if(global.user.id == user.id){
					
					this.disableACLs();
					
					this.create(user).then((user) => {
						
						this.enableACLs();
						
						resolve(user);
						
					}).catch((error) => {
					
						reject(error);
					
					});
					
				}
			
			}
			
		});
		
	}	
	
	getUserByAccessKeyId(access_key_id){
	
		return this.getBySecondaryIndex('access_key_id', access_key_id, 'access_key_id-index');
		
	}
	
	isPartiallyHydratedUser(user){
		
		return new Promise((resolve, reject) => {
				
			return resolve(true);
			
			//Technical Debt:  There are problems with the Entity validate method.
			/*
			this.validate(user, 'partially_hydrated_user').then((validation) => {
				
				return resolve(true);
			
				if(_.has(validation, 'errors') && validation.errors.length > 0){
				
					//du.warning('Partially Hydrated User validation errors', validation.errors);
					
					return resolve(false);
					
				}else{
				
					//du.debug('Partially Hydrated User validated structurally.');
					
					return resolve(true);
					
				}
				
			}).catch((error) => {
			
				return reject(error);
				
			});
			*/
			
		});
		
	}
	
	assureUser(user_id){
		
		return new Promise((resolve, reject) => {
			
			du.debug('Assure User');
			du.highlight('User ID: ', user_id);
				
			this.get(user_id).then((user) => {
		
				if(_.has(user, 'id')){
					
					du.highlight('User Existed', user);
					
					return resolve(user);
					
				}else{
					
					let user_object = {
						id: user_id,
						termsandconditions: "0",
						active: "false",
						auth0id: "-",
						name: "-"
					};
					
					du.highlight('New User', user_object);
					
					this.create(user_object).then((user) => {
						
						if(_.has(user, 'id')){
						
							return resolve(user);
							
						}else{
						
							return reject(new Error('Unable to assure user.'));
							
						}
						
					});
					
				}
			
			}).catch((error) => {
			
				return reject(error);
				
			});
			
		});

	}
	
	acceptInvite(invite){
		
		return new Promise((resolve, reject) => {
			
			inviteutilities.decodeAndValidate(invite.token, invite.parameters).then((invite_parameters) => {
				
				du.highlight('Invite Parameters', invite_parameters);
				
				this.disableACLs();
				
				this.assureUser(invite_parameters.email).then((user) => {
					
					du.highlight('User to Accept Invite:', user);
					
					let user_acl_object = {
						account: invite_parameters.account,
						role: invite_parameters.role,
						user: user.id
					}
					
					userACLController.assure(user_acl_object).then((useracl) => {
						
						du.highlight("Assured UserACL", useracl);
						
						//Technical Debt:  we need to return some sort of success message here and force the user to login rather than returning the user as an object.
						this.getHydrated(user.id).then((user) => {
							
							return resolve(user);
						
						}).catch((error) => {
						
							return reject(error);
							
						});
						
					}).catch((error) => {
					
						return reject(error);
						
					});
					
				});
			
			}).catch((error) => {
			
				return reject(error);
				
			});
			
		});

	}
	
	invite(userinvite){
	
		return new Promise((resolve, reject) => {
			
			du.highlight('User Invite: ', userinvite);
			
			if(!this.isEmail(userinvite.email)){
				reject(new Error('Invalid user email address.'));
			}
			
			var promises = [];
			//refactored
			promises.push(accountController.get(userinvite.account));
			promises.push(roleController.get(userinvite.role));
			promises.push(this.get(userinvite.email));
			
			Promise.all(promises).then((promises) => {
			
				let account = promises[0];
				let role = promises[1];
				let invited_user = promises[2];
				
				du.highlight(account);
				du.highlight(role);
				du.highlight(invited_user);
						
				if(!_.has(account, 'id')){ reject(new Error('Invalid account.')); }
				//is the account that we are operating against 
				
				if(!_.has(role, 'id')){ reject(new Error('Invalid role.')); }
				//is not the owner
				//role is not higher than the inviting user's role
				
				if(_.has(invited_user, 'email')){
					
					//make sure that the user isn't already on the account with the same role.
					
				}
				
				let invite_parameters = {email:userinvite.email, account: account.id, role: role.id};
				
				inviteutilities.invite(invite_parameters).then((link) => {
						
					return resolve({link:link});
						
				}).catch((error) => {
						
					return reject(error);
						
				});
				
			});
			
		});
		
	}
	        
}

module.exports = new userController();