'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');

var entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class userACLController extends entityController {

    constructor(){
        super('useracl');
    }

    getPartiallyHydratedACLObject(useracl){

        du.debug('Get Partially Hydrated ACL Object');

        let promises = [];

        promises.push(this.getAccount(useracl));
        promises.push(this.getRole(useracl));

        return Promise.all(promises).then(promises => {

          useracl.account = promises[0];
          useracl.role = promises[1];

          return Promise.resolve(useracl);

        });

    }

    //Technical Debt:  Deprecated
    getACLByUser({user: user}){

      du.debug('getACLByUser');

      return this.queryBySecondaryIndex({field: 'user', index_value: this.getID(user), index_name: 'user-index'});

    }

    create({entity, primary_key}) {

      du.debug('UserACLController Create');

      return super.create({entity: entity, primary_key: primary_key}).then((acl) => {
        return this.createNotification(acl, 'created', 'You have been assigned to a new account.');
      });

    }

    update({entity, primary_key}) {

      du.debug('UserACLController Update');

      return super.update({entity: entity, primary_key: primary_key}).then((acl) => {

        this.createNotification(acl, 'updated', 'Your role on account has been updated.');

      });

    }

    delete(acl, primary_key) {

        return super.delete({entity: acl, primary_key: primary_key})
            .then(() =>
                this.createNotification(acl, 'deleted', 'You have been removed from account.')
                    .then(() => acl)
                    .catch(() => acl));
    }

    //Technical Debt:  This doesn't go here.
    createNotification(acl, action, text) {

      du.debug('Create Notification');
        let notification = {
            account: acl.account,
            user: acl.user,
            type: 'acl',
            action: action,
            title: text,
            body: text
        };

        let notificationProviderController = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

        return notificationProviderController.createNotificationForAccountAndUser(notification);

    }

    getACLByAccount({account}){

      du.debug('Get ACL By Account');

      global.disableaccountfilter = true;
      return this.queryBySecondaryIndex({field: 'account', index_value: this.getID(account), index_name: 'account-index'}).then((result) => {
        global.disableaccountfilter = false;
        return this.getResult(result);
      });

    }

    getUser(useracl){

      du.debug('Get User');

      if(_.has(useracl, 'user') && _.has(useracl.user, 'id')){
          return useracl.user;
      }

      return this.executeAssociatedEntityFunction('userController', 'get', {id: useracl.user});

    }

    getAccount(useracl){

      du.debug('Get Account');

      if(_.has(useracl, 'account') && _.has(useracl.account, 'id')){
          return useracl.account;
      }

      return this.executeAssociatedEntityFunction('accountController', 'get', {id: useracl.account});

    }

    getRole(useracl){

      du.debug('Get Role');

      if(_.has(useracl, 'role') && _.has(useracl.role, 'id')){
          return useracl.role;
      }

      return this.executeAssociatedEntityFunction('roleController', 'get', {id: useracl.role});

    }

    assure(useracl){

      du.debug('Assure');

      return new Promise((resolve, reject) => {

          this.getACLByUser({user: useracl.user}).then((useracls) => {

              let acl = this.getResult(useracls);

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
                  return this.create({entity: useracl}).then((acl) => {
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
