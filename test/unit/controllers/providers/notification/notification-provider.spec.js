let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

function getValidNotificationSettings(){

    return {
        settings:
            {
                notification_groups: [{
                    notifications: [{
                        default: 'any_default',
                        key: 'a_type_of_notification'
                    }]
                }]
            }
    }
}
function getValidUserSettings(){

    return {
        notifications: [{
                "name": "six",
                "receive": true
            },
            {
                "name": "email",
                "receive": true,
                "data": "user@example.com"
            },
            {
                "name": "sms",
                "receive": false
            },
            {
                "name": "slack",
                "receive": false
            }]
    }
}

describe('controllers/providers/notification/notification-provider', () => {

    before(() => {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });

    beforeEach(() => {

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/NotificationSetting'), {
            get: ({id: user}) => {
                expect(user).to.be.defined;

                let notification_settings = getValidNotificationSettings();

                notification_settings.settings = JSON.stringify(notification_settings.settings);
                return Promise.resolve(notification_settings);
            },
            getDefaultProfile: () => {
                return Promise.resolve('a_default_profile');
            }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserSetting'), {
            get: ({id: user}) => {
                expect(user).to.be.defined;
                return Promise.resolve(getValidUserSettings());
            }
        });

        mockery.registerMock(global.SixCRM.routes.path('controllers','providers/notification/email-notification-provider'), {
            sendNotificationViaEmail: (notification_object, email_address) => {
                expect(email_address).to.equal('user@example.com');
                expect(notification_object.type).to.equal('alert');
                return Promise.resolve('successfully sent');
            }
        });
    });

    afterEach(() => {
        mockery.resetCache();
    });

    after(() => {
        mockery.deregisterAll();
    });

    describe('validateCreateNotificationObject', () => {
        let valid_object = {
            account: '*',
            type: 'notification',
            category: 'any',
            action: 'any',
            title: 'any',
            body: 'any'
        };

        it('should not allow object without an account', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.account;

            let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

            try {
                return NotificationProvider.validateCreateNotificationObject(notification_object);
            } catch(error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occurred:');
            }
        });

        it('should not allow object without a type', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.type;

            let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

            try {
                return NotificationProvider.validateCreateNotificationObject(notification_object);
            } catch(error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occurred:');
            }
        });

        it('should not allow object without an action', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.action;

            let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

            try {
                return NotificationProvider.validateCreateNotificationObject(notification_object);
            } catch(error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occurred:');
            }
        });

        it('should not allow object without a body', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.body;

            let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

            try {
                return NotificationProvider.validateCreateNotificationObject(notification_object);
            } catch(error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occurred:');
            }
        });

        it('should not allow object without a body', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.category;

            let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

            try {
                return NotificationProvider.validateCreateNotificationObject(notification_object);
            } catch(error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occurred:');
            }
        });

        it('should allow valid object', () => {

            let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

            return NotificationProvider.validateCreateNotificationObject(valid_object).then((result) => {
                expect(result).to.be.defined;
            });
        });

    });

    describe('createNotificationsForAccount', () => {
        let valid_object = {
            account: '*',
            type: 'notification',
            category: 'any_category',
            action: 'any_action',
            title: 'any_title',
            body: 'any_body'
        };

        it('should not create notifications when the account is not defined', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
                create: (notification_object) => {
                    expect(notification_object).not.to.equal(notification_object, '[500] Notification utilities should not have been called.');
                }
            });

            // when
            delete notification_object.account;

            try {
                return NotificationProvider.createNotificationsForAccount(notification_object);
            } catch (error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occurred:');
            }
        });

        it('should create notifications when the object is valid', () => {
            // given
            let notification = {
                type: 'alert'
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL'), {
                queryBySecondaryIndex: () => {
                    return Promise.resolve({
                        useracls: [{
                            user: 'user@example.com'
                        }]
                    });
                }
            });

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification'), {
                create: ({entity: notification_object}) => {
                    expect(notification_object).to.be.defined;
                    expect(notification_object.user).to.equal('user@example.com');
                    expect(notification_object.account).to.equal(valid_object.account);
                    expect(notification_object.type).to.equal(valid_object.type);
                    expect(notification_object.category).to.equal(valid_object.category);
                    expect(notification_object.action).to.equal(valid_object.action);
                    expect(notification_object.title).to.equal(valid_object.title);
                    expect(notification_object.body).to.equal(valid_object.body);
                    return Promise.resolve(notification);
                }
            });
            let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

            return NotificationProvider.createNotificationsForAccount(valid_object).then((result) => {
                expect(result).to.deep.equal([notification]);
            });
        });

    });

    describe('createNotificationForAccountAndUser', () => {
        let valid_object = {
            account: '*',
            user: 'user@example.com',
            type: 'notification',
            category: 'any_category',
            action: 'any_action',
            title: 'any_title',
            body: 'any_body'
        };

        it('should not create notifications when the user is not defined', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
                create: (notification_object) => {
                    expect(notification_object).not.to.equal(notification_object, '[500] Notification utilities should not have been called.');
                }
            });

            // when
            delete notification_object.user;

            try {
                NotificationProvider.createNotificationForAccountAndUser(notification_object)
            } catch(error) {
                // then
                return expect(error.message).to.equal('[500] User is mandatory.');
            }
        });

        it('should create notification when the object is valid', () => {
            // given
            let notification = {
                type: 'alert'
            };

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification'), {
                create: ({entity: notification_object}) => {
                    expect(notification_object).to.be.defined;
                    expect(notification_object.id).to.be.defined;
                    expect(notification_object.user).to.equal(valid_object.user);
                    expect(notification_object.account).to.equal(valid_object.account);
                    expect(notification_object.type).to.equal(valid_object.type);
                    expect(notification_object.category).to.equal(valid_object.category);
                    expect(notification_object.action).to.equal(valid_object.action);
                    expect(notification_object.title).to.equal(valid_object.title);
                    expect(notification_object.body).to.equal(valid_object.body);
                    return Promise.resolve(notification);
                }
            });

            let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

            return NotificationProvider.createNotificationForAccountAndUser(valid_object).then((result) => {
                expect(result).to.deep.equal(notification);
            });
        });

    });

});
