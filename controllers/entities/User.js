'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const mungeutilities = global.SixCRM.routes.include('lib', 'munge-utilities.js');
const inviteutilities = global.SixCRM.routes.include('lib', 'invite-utilities.js');

const notificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

//Technical Debt:  The list method here is tricky
class userController extends entityController {

    constructor(){
        super('user');
    }

    //Technical Debt: finish!
    //usersigningstring
    //usersetting
    //userdevicetoken
    //notificationread
    //notification
    //customernote
    associatedEntitiesCheck({id}){

      du.debug('Associated Entities Check');

      let return_array = [];

      let data_acquisition_promises = [
        this.executeAssociatedEntityFunction('userACLController', 'listByUser', {user: id})
      ];

      return Promise.all(data_acquisition_promises).then(data_acquisition_promises => {

        let useracls = data_acquisition_promises[0];

        if(_.has(useracls, 'useracls') && arrayutilities.nonEmpty(useracls.useracls)){
          arrayutilities.map(useracls.useracls, (useracl) => {
            return_array.push(this.createAssociatedEntitiesObject({name:'Campaign', object: useracl}));
          });
        }

        return return_array;

      });

    }

    getUserByAlias(user_alias){

        du.debug('Get User By Alias');

        return new Promise((resolve, reject) => {

            this.disableACLs();

            this.getBySecondaryIndex({field:'alias', index_value: user_alias, index_name: 'alias-index'}).then((user) => {

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

    //Technical Debt:  What a mess.
    getUserStrict(user_string){

        return new Promise((resolve, reject) => {

            if(this.isEmail(user_string)){

                du.debug('Is email: true');

                du.debug('Get User');

                this.disableACLs();

                this.get({id: user_string}).then(user => {

                    this.enableACLs();

                    if(_.has(user, 'id')){

                        du.debug('Have user:', user);

                        this.disableACLs();

                        //Note:  this is redundant...
                        return this.getHydrated({id: user.id}).then((user) => {

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

                return reject(eu.getError('bad_request','A user identifier or a email is required.'));

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

                                return reject(eu.getError('server','User created in profile is not a partially-hydrated user.'));

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

                    return reject(eu.getError('bad_request','Global User must be of type User or Email.'));

                }

            }else{

                return reject(eu.getError('bad_request','Introspection method requires a global user.'));

            }

        });

    }

    createProfile(email){

        return new Promise((resolve, reject) => {

            this.disableACLs();

            this.get({id: email}).then((user) => {

                if(_.has(user, 'id')){

                    return reject(eu.getError('bad_request','The user already exists.'));

                }else{

                    let account_id = this.getUUID();
                    let proto_account = {
                        id: account_id,
                        name: email+'-pending-name',
                        active: false
                    };
                    let proto_user = {
                        id: email,
                        name: email,
                        active: false,
                        first_name: email, // Technical Debt: Find another way to pass validation instead of using email.
                        last_name: email, // Technical Debt: Find another way to pass validation instead of using email.
                    };
                    let proto_user_setting = {
                        id: email,
                        timezone: 'America/Los_Angeles',
                        notifications: [{
                            name: "six",
                            receive: true
                        },
                        {
                            name: "email",
                            receive: false
                        },
                        {
                            name: "sms",
                            receive: false
                        },
                        {
                            name: "slack",
                            receive: false
                        },
                        {
                            name: "skype",
                            receive: false
                        },
                        {
                            name: "ios",
                            receive: false
                        }]
                    };

                    proto_user = this.appendAlias(proto_user);

                    let promises = [];

                    promises.push(this.executeAssociatedEntityFunction('accountController', 'create', {entity: proto_account}));
                    promises.push(this.create({entity: proto_user}));
					          //Technical Debt:  This should be a lookup, not a hardcoded string
                    promises.push(this.executeAssociatedEntityFunction('roleController', 'get', {id: 'cae614de-ce8a-40b9-8137-3d3bdff78039'}));
                    promises.push(this.executeAssociatedEntityFunction('userSettingController', 'create', {entity: proto_user_setting}));

                    return Promise.all(promises).then((promises) => {

                        let account = promises[0];
                        let user = promises[1];
                        let role = promises[2];
                        let user_setting = promises[3];

                        if(!_.has(account, 'id') || !_.has(user, 'id') || !_.has(role, 'id') || !_.has(user_setting, 'id')){
                            return reject(eu.getError('server','Unable to create new profile'));
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

                        return this.executeAssociatedEntityFunction('userACLController', 'create', {entity: acl_object}).then((acl) => {

                            acl.account = account;
                            acl.role = role;

                            this.enableACLs();

                            user.acl = [acl];

                            return resolve(user);

                        }).catch((error) => {

                            du.warning(error);
                            return reject(error);

                        });

                    }).catch((error) => {
                      du.error(error);
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

            this.get({id: id}).then((user) => {

                du.debug('Prehydrated User:', user);

                if(_.has(user, 'id')){

                    return this.getACLPartiallyHydrated(user).then((acl) => {

                        du.deep('Partially hydrated User ACL object:', acl);

                        user.acl = acl;

                        return this.isPartiallyHydratedUser(user).then((validated) => {

                            if(validated){

                                return resolve(user);

                            }else{

                                return reject(eu.getError('server','The user is not partially hydrated.'));

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

      du.debug('Get ACL');

      if(_.has(user, 'acl') && _.isArray(user.acl)){
          return user.acl;
      }

      return this.executeAssociatedEntityFunction('userACLController', 'getACLByUser', {user: user.id})
      .then(useracls => this.getResult(useracls, 'useracls'));

    }

    getACLPartiallyHydrated(user){

      du.debug('Get ACL Partially Hydrated');

      return this.executeAssociatedEntityFunction('userACLController','queryBySecondaryIndex', {field: 'user', index_value: user.id, index_name: 'user-index'})
      .then((response) => this.getResult(response, 'useracls'))
      .then((acls) => {

        du.debug('ACLs: ', acls);

        if(!arrayutilities.nonEmpty(acls)){
          return null;
        }

        //Technical Debt:  Convert to a list query where applicable
        let acl_promises = arrayutilities.map(acls, (acl) => {
          return this.executeAssociatedEntityFunction('userACLController','getPartiallyHydratedACLObject', acl);
        });

        return Promise.all(acl_promises).then((acl_promises) => {
          return acl_promises;
        });

      });

    }

    getAccount(id){

        if(id == '*'){
            return this.executeAssociatedEntityFunction('accountController', 'getMasterAccount', {});
        }else{
            return this.executeAssociatedEntityFunction('accountController', 'get', {id: id});
        }

    }

    getAccessKey(id){

      du.debug('Get Access Key');

      return this.executeAssociatedEntityFunction('accessKeyController', 'get', {id: id});

    }

    getAccessKeyByKey(id){

      du.debug('Get Access Key By Key');

      return this.executeAssociatedEntityFunction('accessKeyController', 'getAccessKeyByKey', {id: id});

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

                    this.create({entity: user}).then((user) => {

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

        return this.getBySecondaryIndex({field: 'access_key_id', index_value: access_key_id, index_name: 'access_key_id-index'});

    }

    createUserWithAlias(user_input) {

      du.debug('Create User With Alias');

      let user = this.appendAlias(user_input);

      return this.create({entity: user});

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

            this.get({id: user_id}).then((user) => {

                if(_.has(user, 'id')){

                    du.highlight('User Existed', user);

                    return resolve(user);

                }else{

                    let user_object = {
                        id: user_id,
                        termsandconditions: "0",
                        active: false,
                        auth0id: "-",
                        name: "-"
                    };

                    user_object = this.appendAlias(user_object);

                    du.highlight('New User', user_object);

                    return this.create({entity: user_object}).then((user) => {

                        if(_.has(user, 'id')){

                            return resolve(user);

                        }else{

                            return reject(eu.getError('server','Unable to assure user.'));

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

          return inviteutilities.decodeAndValidate(invite.token, invite.parameters).then(invite_parameters => {

            du.highlight('Invite Parameters', invite_parameters);

            this.disableACLs();

            return this.assureUser(invite_parameters.email)
              .then(() => invite_parameters)

          }).then(invite_parameters => {

            return this.executeAssociatedEntityFunction('userACLController', 'get', {id: invite_parameters.acl})

          }).then(user_acl => {

            du.highlight('Acquired UserACL', user_acl);

            if (!user_acl.pending) {
              return reject(eu.getError('bad_request', 'User ACL is not pending.'));
            }

            delete user_acl.pending;

            return this.executeAssociatedEntityFunction('userACLController', 'update', {entity: user_acl});

          }).then(user_acl => {

            du.highlight('UserACL update', user_acl);

            return this.getHydrated(user_acl.user);

          }).then(hydrated_user => {

            du.highlight('Returning hydrated user', hydrated_user);

            return resolve(hydrated_user);

          }).catch((error) => {

            return reject(error);

          });

        }).catch(error => eu.throwError('server', error));

    }

    invite(userinvite){

        return new Promise((resolve, reject) => {

            du.highlight('User Invite: ', userinvite);

            if(!this.isEmail(userinvite.email)){
                reject(eu.getError('bad_request','Invalid user email address.'));
            }

            var promises = [];
			//refactored

            promises.push(this.executeAssociatedEntityFunction('accountController', 'get', {id: userinvite.account}));
            promises.push(this.executeAssociatedEntityFunction('roleController', 'get', {id: userinvite.role}));
            promises.push(this.get({id: userinvite.email}));

            return Promise.all(promises).then((promises) => {

                let account = promises[0];
                let role = promises[1];
                let invited_user = promises[2];

                du.highlight(account);
                du.highlight(role);
                du.highlight(invited_user);

                if(!_.has(account, 'id')){ reject(eu.getError('bad_request','Invalid account.')); }
				//is the account that we are operating against

                if(!_.has(role, 'id')){ reject(eu.getError('bad_request','Invalid role.')); }
				//is not the owner
				//role is not higher than the inviting user's role

                if(_.has(invited_user, 'email')){

					//make sure that the user isn't already on the account with the same role.

                }

                du.debug('Creating pending ACL object.');

                const acl_object = {
                    user: userinvite.email,
                    account: account.id,
                    role: role.id,
                    pending: 'Invite Sent'
                };

                du.debug('ACL object to create:', acl_object);

                return this.executeAssociatedEntityFunction('userACLController', 'create', {entity: acl_object})
                    .then((acl) => {

                        const invite_parameters = {email:userinvite.email, acl: acl.id};

                        du.debug('Sending invitation with parameters', invite_parameters);

                        return inviteutilities.invite(invite_parameters);

                    }).then((link) => {

                        const notification_object = {
                            account: global.account,
                            type: 'notification',
                            category: 'invitation_sent',
                            action: link,
                            title: 'Invitation Sent',
                            body: `User with email ${userinvite.email} has been invited to account ${account.name}.`
                        };

                        return notificationProvider.createNotificationsForAccount(notification_object)
                            .then(() => link)

                    }).then((link) => {

                        return resolve({link: link})

                    })

            }).catch((error) => {

                    return reject(error);

            });

        })

    }

    inviteResend(userinvite) {
        du.debug('Resending Invite', userinvite);

        return new Promise((resolve, reject) => {

            const acl = userinvite.acl;

            return this.executeAssociatedEntityFunction('userACLController', 'get', {id: acl})
                .then((acl_entity) => {
                    du.debug('Found User Acl', acl_entity);

                    if (!acl_entity) {
                        return reject(eu.getError('bad_request','Non Existing User ACL.'));
                    }

                    if (!acl_entity.pending) {
                        return reject(eu.getError('bad_request','Can\'t resend invite, User ACL is not pending.'));
                    }

                    const invite_parameters = {email: userinvite.email, acl: acl.id};

                    return inviteutilities.invite(invite_parameters)

                }).then((link) => {

                    du.debug('Invite successfully resent.');

                    return resolve({link: link});

                }).catch((error) => {

                    return reject(error);

                });

        }).catch(error => eu.throwError('server', error));

    }

    getFullName(user){

      du.debug('Get Full Name');

      let full_name = null;

      if(_.has(user, 'first_name')){

        full_name = user.first_name;

      }

      if(_.has(user, 'last_name')){

        if(_.isString(full_name)){
          full_name += ' '+user.last_name;
        }else{
          full_name = user.last_name;
        }

      }

      return full_name;

    }

    getUsersByAccount({pagination, fatal}){

      du.debug('Get Users By Account');

      if(global.account == '*'){

        return this.list({pagination: pagination, fatal: fatal});

      }else{

        return this.executeAssociatedEntityFunction('userACLController', 'getACLByAccount', {account: global.account, fatal: fatal}).then(user_acl_objects => {

          if(arrayutilities.isArray(user_acl_objects) && user_acl_objects.length > 0){

            let user_ids = arrayutilities.map(user_acl_objects, (user_acl) => {
              if(_.has(user_acl, 'user')){
                return user_acl.user;
              }
            });

            user_ids = arrayutilities.unique(user_ids);

            let in_parameters = this.createINQueryParameters({field:'id', list_array: user_ids});

            //Technical Debt:  Refactor, must return all users with correct pagination
            return this.list({pagination: pagination, query_parameters: in_parameters});

          }else{

            return null;

          }

        });

      }

    }

}

module.exports = new userController();
