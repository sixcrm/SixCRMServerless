'use strict';
const _ = require('underscore');
const uuidV4 = require('uuid/v4');

const du = require('../lib/debug-utilities.js');
const mungeutilities = require('../lib/munge-utilities.js');
const inviteutilities = require('../lib/invite-utilities.js');

const accountController = require('./Account.js');
const userSettingController = require('./UserSetting.js');
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

    getUserByAlias(user_alias){

        du.debug('Get User By Alias');

        return new Promise((resolve, reject) => {

            this.disableACLs();

            this.getBySecondaryIndex('alias', user_alias, 'alias-index').then((user) => {

                if(_.has(user, 'id')){

                    return this.getHydrated(user.id).then((user) => {

                        this.enableACLs();

                        return resolve(user);

                    }).catch((error) => {

                        return reject(error);

                    });

                }else{

                    return resolve(false);

                }

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    getUserStrict(user_string){

        return new Promise((resolve, reject) => {

            if(this.isEmail(user_string)){

                du.debug('Is email: true');

                du.debug('Get User');

                this.disableACLs();

                this.get(user_string).then((user) => {

                    this.enableACLs();

                    if(_.has(user, 'id')){

                        du.debug('Have user:', user);

                        this.disableACLs();

                        return this.getHydrated(user.id).then((user) => {

                            this.enableACLs();

							//Technical Debt:  This is questionable...
                            this.setGlobalUser(user);

                            return resolve(user);

                        }).catch((error) => {

                            du.warning(error);

                            return reject(error);

                        });

                    }else{

						//Technical Debt:  This is questionable...
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
                        return this.isPartiallyHydratedUser(user).then((validated) => {

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
                    let proto_account = {
                        id: account_id,
                        name: email+'-pending-name',
                        active: 'false'
                    };
                    let proto_user = {
                        id: email,
                        name: email,
                        active: "false"
                    };
                    let proto_user_setting = {
                        id: email,
                        notifications: {
                            name: "six",
                            receive: true
                        }
                    };

                    proto_user = this.appendAlias(proto_user);

                    let promises = [];

                    promises.push(accountController.create(proto_account));
                    promises.push(this.create(proto_user));

					//Technical Debt:  This should be a lookup, not a hardcoded string
                    promises.push(roleController.get('cae614de-ce8a-40b9-8137-3d3bdff78039'));

                    promises.push(userSettingController.create(proto_user_setting));

                    return Promise.all(promises).then((promises) => {

                        let account = promises[0];
                        let user = promises[1];
                        let role = promises[2];
                        let user_setting = promises[3];

                        if(!_.has(account, 'id') || !_.has(user, 'id') || !_.has(role, 'id') || !_.has(user_setting, 'id')){
                            return reject(new Error('Unable to create new profile'));
                        }

                        du.debug('User', user);
                        du.debug('Role', role);
                        du.debug('Account', account);
                        du.debug('User setting', user_setting);

                        let acl_object = {
                            user: user.id,
                            account: account_id,
                            role: role.id
                        };

                        du.debug('ACL object to create:', acl_object);

                        return userACLController.create(acl_object).then((acl) => {


                            acl.account = account;
                            acl.role = role;

                            du.debug(acl);

                            this.enableACLs();

                            user.acl = [acl];


                            return resolve(user);

                        }).catch((error) => {

                            du.warning(error);
                            return reject(error);

                        });

                    }).catch((error) => {

                        return reject(error);

                    });

                }

            }).catch((error) => {

                return reject(error);

            });

        });

    }

    getHydrated(id){

        return new Promise((resolve, reject) => {

            this.get(id).then((user) => {

                du.debug('Prehydrated User:', user);

                if(_.has(user, 'id')){

                    return this.getACLPartiallyHydrated(user).then((acl) => {

                        du.debug('Partially hydrated User ACL object:', acl);

                        user.acl = acl;

                        du.debug(this);

                        return this.isPartiallyHydratedUser(user).then((validated) => {

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

            du.debug('User: ', user.id);

			      //Technical Debt:  This is required.  Must be extended by the UserACL controller itself?
            var userACLController = require('./UserACL.js');

            userACLController.queryBySecondaryIndex('user', user.id, 'user-index')
              .then((response) => this.getResult(response, 'useracls'))
              .then((acls) => {

                  du.debug('ACLs: ', acls);

                  if(_.isNull(acls)){
                      return resolve(null);
                  }

                  du.debug('ACLs: ', acls);

                  let acl_promises = acls.map(acl => userACLController.getPartiallyHydratedACLObject(acl));

                  return Promise.all(acl_promises).then((acl_promises) => {

                      return resolve(acl_promises);

                  }).catch((error) => {

                      return reject(error);
                  });

              }).catch((error) => {
                  return reject(error);
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

                    user = this.appendAlias(user);

                    this.create(user).then((user) => {

                        this.enableACLs();

                        return resolve(user);

                    }).catch((error) => {

                        return reject(error);

                    });

                }

            }

        });

    }

    appendAlias(user){

        if(!_.has(user, 'alias')){

            user['alias'] = mungeutilities.munge(user.id);

        }

        return user;

    }

    getUserByAccessKeyId(access_key_id){

        return this.getBySecondaryIndex('access_key_id', access_key_id, 'access_key_id-index');

    }

    isPartiallyHydratedUser(user){ // eslint-disable-line no-unused-vars

        return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars

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

                    user_object = this.appendAlias(user_object);

                    du.highlight('New User', user_object);

                    return this.create(user_object).then((user) => {

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

            return inviteutilities.decodeAndValidate(invite.token, invite.parameters).then((invite_parameters) => {

                du.highlight('Invite Parameters', invite_parameters);

                this.disableACLs();

                return this.assureUser(invite_parameters.email).then((user) => {

                    du.highlight('User to Accept Invite:', user);

                    let user_acl_object = {
                        account: invite_parameters.account,
                        role: invite_parameters.role,
                        user: user.id
                    }

                    return userACLController.assure(user_acl_object).then((useracl) => {

                        du.highlight("Assured UserACL", useracl);

						//Technical Debt:  we need to return some sort of success message here and force the user to login rather than returning the user as an object.
                        return this.getHydrated(user.id).then((user) => {

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

            return Promise.all(promises).then((promises) => {

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

                return inviteutilities.invite(invite_parameters).then((link) => {

                    return resolve({link:link});

                }).catch((error) => {

                    return reject(error);

                });

            });

        });

    }

}

module.exports = new userController();
