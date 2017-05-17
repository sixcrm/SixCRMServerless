'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');

var accountController = global.routes.include('controllers', 'entities/Account.js');
var roleController = global.routes.include('controllers', 'entities/Role.js');

//Technical Debt: This is null when the UserACLController is included from the context of the UserController
var userController = global.routes.include('controllers', 'entities/User.js');
var entityController = global.routes.include('controllers', 'entities/Entity.js');

class userACLController extends entityController {

    constructor(){
        super(process.env.users_table, 'useracl');
        this.table_name = process.env.user_acls_table;
        this.descriptive_name = 'useracl';
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

    getACLByAccount(account){

        du.debug('getACLByAccount');
        return this.queryBySecondaryIndex('account', account, 'account-index').then((result) => this.getResult(result));

    }

    getUser(useracl){

        du.debug('getUser', useracl);
        if(_.has(useracl, 'user') && _.has(useracl.user, 'id')){
            return useracl.user;
        }

		//necessary because of embedded embeds (etc)
        let userController = global.routes.include('controllers', 'entities/User.js');

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
