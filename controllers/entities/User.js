'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');

const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const mungeutilities = global.SixCRM.routes.include('lib', 'munge-utilities.js');

const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
const TermsAndConditionsController = global.SixCRM.routes.include('helpers', 'terms-and-conditions/TermsAndConditions.js');
const termsAndConditionsController = new TermsAndConditionsController();

//Technical Debt:  The list method here is tricky
module.exports = class UserController extends entityController {

    constructor(){
        super('user');

        this.search_fields = ['name', 'firstname', 'lastname'];

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

      return Promise.resolve(this.disableACLs())
      .then(() => this.getBySecondaryIndex({field:'alias', index_value: user_alias, index_name: 'alias-index'}))
      .then((user) => {

        this.enableACLs();
        return user;

      }).then((user) => {

        if(!_.has(user, 'id')){
          eu.throwError('not_found', 'User not found: '+user_alias);
        }

        return user;

      }).then((user) => {

        return Promise.resolve(this.disableACLs())
        .then(() => this.getHydrated(user.id));

      }).then((user) => {

        this.enableACLs();
        return user;

      }).catch(error => {

        if(error.code == '404'){
          return Promise.resolve(false);
        }

        eu.throwError(error);

      });

    }

    getUserStrict(user_email){

      du.debug('Get User Strict');

      if(!stringutilities.isEmail(user_email)){
        eu.throwError('bad_request','A user identifier or a email is required, "'+user_email+'" provided');
      }

      return Promise.resolve(this.disableACLs())
      .then(() => this.get({id: user_email}))
      .then((user) => {

        this.enableACLs();

        return user;

      }).then((user) => {

        if(_.isNull(user) || !_.has(user, 'id')){
          eu.throwError('not_found', 'User not found: '+user_email);
        }

        return user;

      }).then((user) => {

        this.setGlobalUser(user);

        return user;

      }).then((user) => {

        this.disableACLs();
        return this.getACLPartiallyHydrated(user).then((acl) => {
          this.enableACLs();

          global.user.acl = acl;
          return user;
        });

      }).catch(error => {

        if(error.code == '404'){
          return Promise.resolve(false);
        }
        du.error(error);
        eu.throwError(error);

      });

    }

    validateGlobalUser(){

      du.debug('Validate Global User');

      if(!objectutilities.hasRecursive(global, 'user.id') || !this.isEmail(global.user.id)){
        eu.throwError('server', 'Unexpected argumentation');
      }

      return true;

    }

    introspection(){

      du.debug('Introspection');

      if(!_.has(global, 'user')){
        eu.throwError('bad_request','Introspection method requires a global user.');
      }

      //Technical Debt:  This needs to get reduced
      if(this.isEmail(global.user)){

        return this.createProfile(global.user)
        .then((user) => {

          return this.isPartiallyHydratedUser(user).then(validated => {
            if(validated != true){
              eu.throwError('server','User created in profile is not a partially-hydrated user.');
            }

            return user;
          });

        }).then(user => {

          this.setGlobalUser(user);

          return this.introspection();

        });

      }

      this.validateGlobalUser();

      return termsAndConditionsController.getLatestTermsAndConditions()
      .then(terms_and_conditions => {

        if(!_.has(terms_and_conditions, 'version')){
          eu.throwError('server', 'Unable to acquire Terms & Conditions');
        }

        if (terms_and_conditions.version !== global.user.termsandconditions) {
          global.user.termsandconditions_outdated = true;
        }

        return true;

      }).then(() => termsAndConditionsController.getLatestTermsAndConditions('owner'))
      .then(owner_terms_and_conditions => {

        let acls = [];

        if(objectutilities.hasRecursive(global, 'user.acl') && arrayutilities.nonEmpty(global.user.acl)){
          acls = arrayutilities.map(global.user.acl, (acl) => {
            if (acl.role.name === 'Owner' && acl.termsandconditions !== owner_terms_and_conditions.version) {
              acl.termsandconditions_outdated = true;
            }
            return acl;
          });
        }

        global.user.acl = acls;

        return true;

      }).then(() => {

        return Promise.resolve(this.disableACLs())
        .then(() => this.executeAssociatedEntityFunction('userSettingController', 'get', {id: global.user.id}))
        .then((settings) => {

          this.enableACLs();
          return settings;

        }).then((settings) => {

          global.user.usersetting = settings;
          return global.user;

        }).catch((error) => {

          this.enableACLs();

          eu.throwError(error);

        });

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
                    promises.push(this.executeAssociatedEntityFunction('RoleController', 'get', {id: 'cae614de-ce8a-40b9-8137-3d3bdff78039'}));
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
        return this.get({id}).then((user) => {
            du.debug('Prehydrated User:', user);
            if (!_.has(user, 'id')) {
                const error = new Error();

                error.name = 'NullUserError';
                throw error;
            }
            return Promise.all([user, this.getACLPartiallyHydrated(user)]);
        })
        .then(([user, acl]) => {
            du.deep('Partially hydrated User ACL object:', acl);
            user.acl = acl;
            return Promise.all([user, this.isPartiallyHydratedUser(user)]);
        })
        .then(([user, validated]) => {
            if (!validated) {
                eu.throwError('server','The user is not partially hydrated.');
            }
            return user;
        })
        .catch(error => {
            if (error.name === 'NullUserError') {
                return null;
            }
            throw error;
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

    //Necessary?
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

        return Promise.all(acl_promises);
      });
    }

    //Technical Debt: Why is this here?
    getAccount(id){

      du.debug('Get Account');

      if(id == '*'){
        return this.executeAssociatedEntityFunction('accountController', 'getMasterAccount', {});
      }

      return this.executeAssociatedEntityFunction('accountController', 'get', {id: id});

    }

    getAccessKey(id){

      du.debug('Get Access Key');

      return this.executeAssociatedEntityFunction('accessKeyController', 'get', {id: id});

    }

    getAccessKeyByKey(id){

      du.debug('Get Access Key By Key');

      return this.executeAssociatedEntityFunction('accessKeyController', 'getAccessKeyByKey', {id: id});

    }

    createStrict(user){

      du.debug('Create Strict');

      if(!objectutilities.hasRecursive(global, 'user.id')){
        eu.throwError('server', 'Unset user in globals');
      }

      if(global.user.id != user.id){
        eu.throwError('server', 'User ID does not match Global User ID');
      }

      this.disableACLs();

      return Promise.resolve(this.disableACLs())
      .then(() => this.create({entity: user}))
      .then((user) => {
        this.enableACLs();
        return user;
      });

    }

    appendAlias(user){

      du.debug('Append Alias');

      if(!_.has(user, 'alias')){
        user.alias = mungeutilities.munge(user.id);
      }

      return user;

    }

    getUserByAccessKeyId(access_key_id){

      du.debug('Get User By Access Key ID');

      return this.getBySecondaryIndex({field: 'access_key_id', index_value: access_key_id, index_name: 'access_key_id-index'});

    }

    create({entity: user}){

      du.debug('User.create');

      user = this.appendAlias(user);

      return super.create({entity: user});

    }

    //Technical Debt:  Garbage...
    isPartiallyHydratedUser(user){ // eslint-disable-line no-unused-vars

      return Promise.resolve(true);

    }

    createUserPrototype(user_id){

      du.debug('Create User Prototype');

      let user_prototype = {
          id: user_id,
          termsandconditions: "0.0",
          active: true,
          auth0id: "-",
          name: user_id
      };

      return this.appendAlias(user_prototype);

    }

    //Technical Debt:  Move this to the UserSetting Entity...
    createUserSettingPrototype(user_id){

      du.debug('Create User Setting Prototype');

      return {
        id: user_id,
        timezone: 'America/Los_Angeles',
        notifications: [
          {
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

    }

    assureUser(user_id){

      du.debug('Assure User');

      return this.get({id: user_id})
      .then((user) => {

        if(_.has(user, 'id')){
          return user;
        }

        return Promise.resolve(this.createUserPrototype(user_id))
        .then((user_prototype) => this.create({entity: user_prototype}))
        //Technical Debt... we should add a feature to entity class that automatically executes a method on create
        .then((user) => this.createUserSettingPrototype(user.id))
        .then((user_setting_prototype) => this.executeAssociatedEntityFunction('userSettingController', 'create', {entity: user_setting_prototype}))
        .then(() => user);

      });

    }

  getUsersByAccount({pagination, fatal}){

    du.debug('Get Users By Account');

    if(this.isMasterAccount()){
      return this.list({pagination: pagination, fatal: fatal});
    }

    return this.executeAssociatedEntityFunction('userACLController', 'getACLByAccount', {account: global.account, fatal: fatal})
    .then((user_acl_objects) => {

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

      }

      return null;

    });

  }

  can({account, object, action, id, fatal}){

    du.debug('User.can()');

    if(action === 'update' && objectutilities.hasRecursive(global, 'user.id') && global.user.id === id) {
      return Promise.resolve(true);
    }

    return super.can({account: account, object: object, action: action, id: id, fatal: fatal})

  }

}
