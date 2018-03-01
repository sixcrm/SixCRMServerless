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

    getACLByUser({user: user}){

      du.debug('Get ACL By User');

      return this.listByUser({user:user});

    }

    create({entity, primary_key}) {

      du.debug('UserACLController Create');

      return super.create({entity: entity, primary_key: primary_key}).then((acl) => {
        this.createNotification(acl, 'created', 'You have been assigned to a new account.');
        return acl;
      });


    }

    update({entity, primary_key}) {

      du.debug('UserACLController Update');

      return super.update({entity: entity, primary_key: primary_key}).then((acl) => {

        this.createNotification(acl, 'updated', 'Your role on account has been updated.');
        return acl;

      });

    }

    updateTermsAndConditions(useracl_terms_and_conditions) {

      du.debug('UserACLController Terms And Conditions Update', useracl_terms_and_conditions);

      return this.get({id: useracl_terms_and_conditions.useracl}).then((acl) => {
        acl.termsandconditions = useracl_terms_and_conditions.version;

        return super.update({entity: acl});
      })

    }

    delete({id, primary_key}) {

      return super.delete({id: id, primary_key: primary_key}).then((acl) => {

        //Technical Debt:  Broken
        //this.createNotification(acl, 'deleted', 'You have been removed from account.');

        return acl;

      });

    }

    //Technical Debt:  This doesn't go here.
    createNotification(acl, action, text) {

      du.debug('Create Notification');
        let notification = {
            account: acl.account,
            user: acl.user,
            type: 'notification',
            category: 'acl',
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

      return this.executeAssociatedEntityFunction('userController', 'get', {id: useracl.user}).then((user) => {
          if (!user) {
              const partial_user = {id: useracl.user, name: useracl.user};

              du.debug('No User found for ACL, return partially hydrated user', partial_user);

              return Promise.resolve(partial_user);
          }

          return Promise.resolve(user);
      });

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

      return this.executeAssociatedEntityFunction('roleController', 'getUnsharedOrShared', {id: useracl.role});

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

    listByRole({pagination, fatal, role}){

      du.debug('Get ACL By Role');

      const query_parameters = {
        filter_expression: '#role = :rolev',
        expression_attribute_values: { ':rolev': this.getID(role) },
        expression_attribute_names: { '#role': 'role' }
      };

      return this.listByAccount({query_parameters: query_parameters, pagination: pagination, fatal: fatal, role: role});

    }

}

module.exports = new userACLController();
