'use strict'
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const stringutilities = global.SixCRM.routes.include('lib', 'string-utilities.js');
const mungeutilities = global.SixCRM.routes.include('lib', 'munge-utilities.js');

module.exports = class UserHelperController{

  constructor(){

  }

  appendAlias(user){

    du.debug('Append Alias');

    if(!_.has(user, 'alias')){
      user.alias = mungeutilities.munge(user.id);
    }

    return user;

  }

  getFullName(user){

    du.debug('Get Full Name');

    let full_name = [];

    if(_.has(user, 'first_name')){
      full_name.push(user.first_name);
    }

    if(_.has(user, 'last_name')){
      full_name.push(user.last_name);
    }

    full_name = arrayutilities.compress(full_name, ' ', '');

    if(stringutilities.nonEmpty(full_name)){
      return full_name;
    }

    return null;

  }

  getAddress(user){

    du.debug('Get Address');

    if(_.has(user, 'address')){

        return user.address;

    }

    return null;

  }

  getPrototypeUser(email){

    du.debug('Get Prototype User');

    let prototype_user = {
      id: email,
      name: email,
      active: false,
      first_name: email, // Technical Debt: Find another way to pass validation instead of using email.
      last_name: email // Technical Debt: Find another way to pass validation instead of using email.
    };

    return prototype_user;

  }

  createProfile(email){

    du.debug('Create Profile');
    return Promise.resolve()
    .then(() => {

      if(!stringutilities.isEmail(email)){
        eu.throwError('server', 'Email is not a email: "'+email+'".');
      }

    }).then(() => {

      if(!_.has(this, 'userController')){
        const UserController = global.SixCRM.routes.include('entities','User.js');
        this.userController = new UserController();
      }

      this.userController.disableACLs();

      return this.userController.get({id: email}).then((user) => {

        if(!_.isNull(user)){
          eu.throwError('bad_request', 'A user account associated with the email "'+email+'" already exists.');
        }
        return null;
      });

    }).then(() => {

      if(!_.has(this, 'accountHelperController')){
        const AccountHelperController = global.SixCRM.routes.include('helpers', 'entities/account/Account.js');
        this.accountHelperController = new AccountHelperController();
      }

      if(!_.has(this, 'userSettingHelperController')){
        const UserSettingHelperController = global.SixCRM.routes.include('helpers', 'entities/usersetting/UserSetting.js');
        this.userSettingHelperController = new UserSettingHelperController();
      }

      let prototype_user = this.getPrototypeUser(email);
      let prototype_account = this.accountHelperController.createPrototypeAccount(email)
      let prototype_user_setting = this.userSettingHelperController.createPrototypeUserSetting(email);

      return {
        prototype_user: prototype_user,
        prototype_account: prototype_account,
        prototype_user_setting: prototype_user_setting
      };

    }).then(({prototype_user, prototype_account, prototype_user_setting}) => {

      if(!_.has(this, 'accountController')){
        const AccountController = global.SixCRM.routes.include('entities', 'Account.js');
        this.accountController = new AccountController();
      }

      if(!_.has(this, 'roleController')){
        const RoleController = global.SixCRM.routes.include('entities', 'Role.js');
        this.roleController = new RoleController();
      }

      if(!_.has(this, 'userSettingController')){
        const UserSettingController = global.SixCRM.routes.include('entities', 'UserSetting.js');
        this.userSettingController = new UserSettingController();
      }

      if(!_.has(this, 'userController')){
        const UserController = global.SixCRM.routes.include('entities', 'User.js');
        this.userController = new UserController();
      }

      let promises = [];

      promises.push(this.accountController.create({entity: prototype_account}));
      promises.push(this.userController.create({entity: prototype_user}));
      //Technical Debt:  This should be a lookup, not a hardcoded string
      //Technical Debt:  This should use a immutable object query...
      promises.push(this.roleController.get({id: 'cae614de-ce8a-40b9-8137-3d3bdff78039'}));
      promises.push(this.userSettingController.create({entity: prototype_user_setting}));

      return Promise.all(promises);

    }).then(([account, user, role, user_setting]) => {

      //Technical Debt:  Need better validation here...

      if(!_.has(account, 'id') || !_.has(user, 'id') || !_.has(role, 'id') || !_.has(user_setting, 'id')){
        eu.throwError('server','Unable to create new profile');
      }

      return {
        account: account,
        user: user,
        role: role,
        user_setting: user_setting
      };

    }).then(({account, user, role}) => {

      if(!_.has(this, 'userACLHelperController')){
        const UserACLHelperController = global.SixCRM.routes.include('helpers', 'entities/useracl/UserACL.js');
        this.userACLHelperController = new UserACLHelperController();
      }

      let prototype_acl_object = this.userACLHelperController.getPrototypeUserACL({user: user.id, account: account.id, role: role.id});

      if(!_.has(this, 'userACLController')){
        const UserACLController = global.SixCRM.routes.include('entities', 'UserACL.js');
        this.userACLController = new UserACLController();
      }

      return this.userACLController.create({entity: prototype_acl_object}).then((acl) => {

        return {acl: acl, account: account, role: role, user: user};

      });

    }).then(({user, acl, account, role}) => {

      //Note:  Phony hydration!
      acl.account = account;
      acl.role = role;
      user.acl = [acl];

      return user;

    }).then((user) => {

      this.enableACLs();
      return user;

    });

  }

}
