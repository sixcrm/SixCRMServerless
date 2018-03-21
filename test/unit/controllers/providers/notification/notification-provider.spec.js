let chai = require('chai');
let expect = chai.expect;
const uuidV4 = require('uuid/v4');
const mockery = require('mockery');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp.js');
const arrayutilities = global.SixCRM.routes.include('lib', 'array-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

function getValidUserSetting(){

  return {}

}

function getValidDefaultNotificationSettings(){

  return {
    settings:{
      notification_groups: [{
          notifications: [{
              default: 'any_default',
              key: 'a_type_of_notification'
          }]
      }]
    }
  };

}

function getValidUserNotificationSettings(){
  return {};
}

describe('controllers/providers/notification/notification-provider', () => {

    beforeEach(() => {
      mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false
      });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('constructor', () => {
      it('successfully constructs', () => {

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        expect(objectutilities.getClassName(notification_provider)).to.equal('NotificationProvider');

      });
    });

    describe('validateNotificationPrototype', () => {
      it('successfully fails to validate', () => {

        let notification_prototype = {};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('action', 'createNotificationForAccountAndUser');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        try{
          notification_provider.validateNotificationPrototype();
        }catch(error){
          expect(error.message).to.equal('[500] User is mandatory in notification prototypes when using the createNotificationsForAccountAndUser method.');
        }

      });

      it('successfully validates', () => {

        let notification_prototype = {user:'someuser@user.com'};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('action', 'createNotificationForAccountAndUser');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        try{
          notification_provider.validateNotificationPrototype();
        }catch(error){
          expect(error.message).to.equal('[500] User is mandatory in notification prototypes when using the createNotificationsForAccountAndUser method.');
        }

      });
    });

    describe('setReceiptUsersFromNotificationPrototype', () => {
      it('successfully sets the user from the notification prototype', () => {
        let notification_prototype = {user:'someuser@user.com'};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        let result = notification_provider.setReceiptUsersFromNotificationPrototype();
        expect(result).to.equal(true);
        expect(notification_provider.parameters.store['receiptusers']).to.deep.equal([notification_prototype.user]);
      });

      it('throws an error when user is not set', () => {
        let notification_prototype = {};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        try{
          notification_provider.setReceiptUsersFromNotificationPrototype();
        }catch(error){
          expect(error.message).to.equal('[500] Unable to identify receipt user in notification prototype');
        }

      });
    });

    describe('setReceiptUsers', () => {

      it('successfully sets the user from the notification prototype', () => {
        let notification_prototype = {user:'someuser@user.com'};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);
        notification_provider.parameters.set('action', 'createNotificationForAccountAndUser');

        let result = notification_provider.setReceiptUsers();
        expect(result).to.equal(true);
        expect(notification_provider.parameters.store['receiptusers']).to.deep.equal([notification_prototype.user]);
      });

      it('successfully sets the users from account acls', () => {

        let acls = [{
          user: 'someuser@test.com'
        },{
          user: 'someotheruser@test.com'
        }];

        let users = arrayutilities.map(acls, acl => {
          return acl.user;
        })

        let notification_prototype = {
          account:'ad58ea78-504f-4a7e-ad45-128b6e76dc57'
        };

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), {
          getACLByAccount:() => {
            return Promise.resolve(acls);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);
        notification_provider.parameters.set('action', 'createNotificationsForAccount');

        return notification_provider.setReceiptUsers().then((result) => {
          expect(result).to.equal(true);
          expect(notification_provider.parameters.store['receiptusers']).to.deep.equal(users);
        });

      });

    });

    describe('setReceiptUsersFromAccount', () => {

      it('successfully throws an error (empty acls)', () => {

        let acls = [];
        let notification_prototype = {account:'ad58ea78-504f-4a7e-ad45-128b6e76dc57'};

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), {
          getACLByAccount:() => {
            return Promise.resolve(acls);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        return notification_provider.setReceiptUsersFromAccount().catch(error => {
          expect(error.message).to.equal('[500] Empty useracls element in account user_acl response');
        });

      });

      it('successfully throws an error (empty acls)', () => {

        let acls = [{
          user: 'someuser@test.com'
        },{
          user: 'someotheruser@test.com'
        }];

        let users = arrayutilities.map(acls, acl => {
          return acl.user;
        })

        let notification_prototype = {account:'ad58ea78-504f-4a7e-ad45-128b6e76dc57'};

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), {
          getACLByAccount:() => {
            return Promise.resolve(acls);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        notification_provider.parameters.set('notificationprototype', notification_prototype);

        return notification_provider.setReceiptUsersFromAccount().then(result => {
          expect(result).to.equal(true);
          expect(notification_provider.parameters.store['receiptusers']).to.deep.equal(users);
        })

      });

    });

    describe('getNotificationSettings', () => {

      it('retrieves notification settings from dynamo', () => {

        let user = 'some@user.com';
        let user_notification_setting = getValidUserNotificationSettings();
        let default_notification_setting = getValidDefaultNotificationSettings();
        let user_setting = getValidUserSetting();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'NotificationSetting.js'), {
          get:() => {
            return Promise.resolve(user_notification_setting);
          },
          getDefaultProfile: () => {
            return Promise.resolve(default_notification_setting);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), {
          get:() => {
            return Promise.resolve(user_setting);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');

        return notification_provider.getNotificationSettings({user: user}).then(({notification_settings, user_settings, default_notification_settings}) => {
          expect(notification_settings).to.deep.equal(user_notification_setting);
          expect(user_settings).to.deep.equal(user_setting);
          expect(default_notification_settings).to.deep.equal(default_notification_setting);
        });

      });

    });

    describe('buildNotificationCategoriesAndTypes', () => {

      it('successfully returns augmented normalized notification settings object', () => {

        let normalized_notification_settings = {};

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        let result = notification_provider.buildNotificationCategoriesAndTypes(normalized_notification_settings);

        expect(result).to.have.property('notification_settings');
        expect(result).to.have.property('notification_categories');
        expect(result).to.have.property('notification_types');

      });

    });

    describe('createNotification', () => {

      it('successfully creates a notification prototype', () => {

        let user = 'someguy@somewhere.com';
        let account = 'ad58ea78-504f-4a7e-ad45-128b6e76dc57';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'lead',
          category: 'transaction',
          context: {
            'category.name': 'Some category name',
            'session.id':'some_session_id'
          },
          name: 'lead'
        };

        let augmented_normalized_notification_settings = {};
        let user_settings = {};

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
          create:({entity}) => {
            entity.id = uuidV4();
            entity.created_at = timestamp.getISO8601();
            entity.updated_at = entity.created_at;
            return Promise.resolve(entity);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.createNotification({
          notification_prototype: a_notification_prototype,
          user: user,
          account: account,
          augmented_normalized_notification_settings: augmented_normalized_notification_settings,
          user_settings: user_settings
        }).then(result => {
          expect(result).to.have.property('id');
          expect(result).to.have.property('created_at');
          expect(result).to.have.property('updated_at');
        });

      });

    });

    describe('saveAndSendNotification', () => {
      it('successfully saves and sends notifcations', () => {

        let user = 'someguy@somewhere.com';
        let account = 'ad58ea78-504f-4a7e-ad45-128b6e76dc57';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'lead',
          category: 'transaction',
          context: {
            'category.name': 'Some category name',
            'session.id':'some_session_id'
          },
          name: 'lead'
        };

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
          create:({entity}) => {
            entity.id = uuidV4();
            entity.created_at = timestamp.getISO8601();
            entity.updated_at = entity.created_at;
            return Promise.resolve(entity);
          }
        });

        let user_notification_setting = getValidUserNotificationSettings();
        let default_notification_setting = getValidDefaultNotificationSettings();
        let user_setting = getValidUserSetting();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'NotificationSetting.js'), {
          get:() => {
            return Promise.resolve(user_notification_setting);
          },
          getDefaultProfile: () => {
            return Promise.resolve(default_notification_setting);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), {
          get:() => {
            return Promise.resolve(user_setting);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.saveAndSendNotification({
          notification_prototype: a_notification_prototype,
          user: user,
          account: account
        }).then(result => {
          expect(result).to.have.property('id');
          expect(result).to.have.property('created_at');
          expect(result).to.have.property('updated_at');
        });
      });
    });

    describe('createNotificationForAccountAndUser', () => {
      it('creates notifications for a account user', () => {

        let user = 'someguy@somewhere.com';
        let account = 'ad58ea78-504f-4a7e-ad45-128b6e76dc57';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'lead',
          category: 'transaction',
          context: {
            'category.name': 'Some category name',
            'session.id':'some_session_id'
          },
          name: 'lead'
        };

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
          create:({entity}) => {
            entity.id = uuidV4();
            entity.created_at = timestamp.getISO8601();
            entity.updated_at = entity.created_at;
            return Promise.resolve(entity);
          }
        });

        let user_notification_setting = getValidUserNotificationSettings();
        let default_notification_setting = getValidDefaultNotificationSettings();
        let user_setting = getValidUserSetting();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'NotificationSetting.js'), {
          get:() => {
            return Promise.resolve(user_notification_setting);
          },
          getDefaultProfile: () => {
            return Promise.resolve(default_notification_setting);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), {
          get:() => {
            return Promise.resolve(user_setting);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.createNotificationForAccountAndUser({notification_prototype: a_notification_prototype}).then(result => {
          expect(result).to.equal(true);
        });
      });
    });

    describe('createNotificationsForAccount', () => {

      it('creates notifications for account users', () => {

        let user = 'someguy@somewhere.com';
        let account = 'ad58ea78-504f-4a7e-ad45-128b6e76dc57';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'lead',
          category: 'transaction',
          context: {
            'category.name': 'Some category name',
            'session.id':'some_session_id'
          },
          name: 'lead'
        };

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
          create:({entity}) => {
            entity.id = uuidV4();
            entity.created_at = timestamp.getISO8601();
            entity.updated_at = entity.created_at;
            return Promise.resolve(entity);
          }
        });

        let user_notification_setting = getValidUserNotificationSettings();
        let default_notification_setting = getValidDefaultNotificationSettings();
        let user_setting = getValidUserSetting();

        mockery.registerMock(global.SixCRM.routes.path('entities', 'NotificationSetting.js'), {
          get:() => {
            return Promise.resolve(user_notification_setting);
          },
          getDefaultProfile: () => {
            return Promise.resolve(default_notification_setting);
          }
        });

        mockery.registerMock(global.SixCRM.routes.path('entities', 'UserSetting.js'), {
          get:() => {
            return Promise.resolve(user_setting);
          }
        });

        let acls = [{
          user: 'someuser@test.com'
        },{
          user: 'someotheruser@test.com'
        }];

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), {
          getACLByAccount:() => {
            return Promise.resolve(acls);
          }
        });

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.createNotificationsForAccount({notification_prototype: a_notification_prototype}).then(result => {
          expect(result).to.equal(true);
        });
      });
    });

    xdescribe('(LIVE) createNotificationForAccountAndUser (LIVE)', () => {
      xit('creates notifications for a account user', () => {

        let user = 'timothy.dalbey@sixcrm.com';
        let account = 'd3fa3bf3-7824-49f4-8261-87674482bf1c';
        let a_notification_prototype = {
          user: user,
          account: account,
          type: 'notification',
          category: 'general',
          context: {},
          name: 'test'
        };

        let PermissionTestGenerators = global.SixCRM.routes.include('test', 'unit/lib/permission-test-generators');
        PermissionTestGenerators.givenUserWithAllowed('*', '*', 'd3fa3bf3-7824-49f4-8261-87674482bf1c');

        let notification_provider = global.SixCRM.routes.include('providers', 'notification/notification-provider.js');
        return notification_provider.createNotificationForAccountAndUser({notification_prototype: a_notification_prototype}).then(result => {
          expect(result).to.equal(true);
        });
      });
    });

});
