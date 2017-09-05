'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

var accountController = global.SixCRM.routes.include('controllers', 'entities/Account.js');
var roleController = global.SixCRM.routes.include('controllers', 'entities/Role.js');

//Technical Debt: This is null when the UserACLController is included from the context of the UserController
var userController = global.SixCRM.routes.include('controllers', 'entities/User.js');
var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');
var notificationProviderController = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider');

class userACLController extends entityController {

    constructor(){
        super('useracl');
    }

	//this is called specifically from the UserController.  Hence the partial hydration...
    getPartiallyHydratedACLObject(useracl){

        du.debug('Get Partially Hydrated ACL Object');

        let promises = [];

        promises.push(this.getAccount(useracl));
        promises.push(this.getRole(useracl));

        return Promise.all(promises).then(promises => {

            useracl.account = promises[0];
            useracl.role = promises[1];

            return Promise.resolve(useracl);

        })

    }

    getACLByUser(user){

        du.debug('getACLByUser', user);
        return this.queryBySecondaryIndex('user', user, 'user-index').then((result) => this.getResult(result));

    }

    create(acl, primary_key) {

        return super.create(acl, primary_key)
            .then((acl) =>
                this.createNotification(acl, 'created', 'You have been assigned to a new account.')
                .then(() => acl)
                .catch(() => acl));
    }

    update(acl, primary_key) {

        return super.update(acl, primary_key)
            .then((acl) =>
                this.createNotification(acl, 'updated', 'Your role on account has been updated.')
                    .then(() => acl)
                    .catch(() => acl));
    }

    delete(acl, primary_key) {

        return super.delete(acl, primary_key)
            .then(() =>
                this.createNotification(acl, 'deleted', 'You have been removed from account.')
                    .then(() => acl)
                    .catch(() => acl));
    }

    createNotification(acl, action, text) {

        let notification = {
            account: acl.account,
            user: acl.user,
            type: 'acl',
            action: action,
            title: text,
            body: text
        };

        return notificationProviderController.createNotificationForAccountAndUser(notification);
    }

    getACLByAccount(account){

        du.debug('getACLByAccount');

        global.disableaccountfilter = true;
        return this.queryBySecondaryIndex('account', account, 'account-index').then((result) => {
          global.disableaccountfilter = false;
          return this.getResult(result);
        });

    }

    getUser(useracl){

        du.debug('getUser', useracl);
        if(_.has(useracl, 'user') && _.has(useracl.user, 'id')){
            return useracl.user;
        }

		//necessary because of embedded embeds (etc)
        let userController = global.SixCRM.routes.include('controllers', 'entities/User.js');

        return userController.get(useracl.user);

    }

    getAccount(useracl){

        du.debug('Get Account');

        if(_.has(useracl, 'account') && _.has(useracl.account, 'id')){
            return useracl.account;
        }

        return accountController.get(useracl.account);

    }

    getRole(useracl){

        du.debug('getRole');

        if(_.has(useracl, 'role') && _.has(useracl.role, 'id')){
            return useracl.role;
        }

        return roleController.get(useracl.role);

    }

    assure(useracl){

        du.highlight('Assure UserACL', useracl);

        return new Promise((resolve, reject) => {

            this.getACLByUser(useracl.user).then((acl) => {

                let identified_acl = false;

                if(!_.isNull(acl)){
                    acl.forEach((acl_object) => {

                        if(acl_object.account == useracl.account){

                            identified_acl = acl_object;
                            return true;

                        }

                    });
                }

                if(_.has(identified_acl, 'id')){
                    du.highlight('Identified ACL:', identified_acl);
                    return resolve(identified_acl);
                }else{
                    du.highlight('Unable to identify ACL');
                    return this.create(useracl).then((acl) => {
                        du.highlight('ACL created: ', acl);
                        return resolve(acl);
                    }).catch((error) => {
                        return reject(error);
                    });

                }

            }).catch((error) => {

                return reject(error);

            });

        });

    }

}

module.exports = new userACLController();
