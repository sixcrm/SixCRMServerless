let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('lib/notification-provider', () => {

    before(() => {
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

    describe('validateCreateNotificationObject', () => {
        let valid_object = {
            account: '*',
            type: 'any',
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

            try {
                return NotificationProvider.validateCreateNotificationObject(notification_object);
            } catch(error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occured:');
            }
        });

        it('should not allow object without a type', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.type;

            try {
                return NotificationProvider.validateCreateNotificationObject(notification_object);
            } catch(error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occured:');
            }
        });

        it('should not allow object without an action', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.action;

            try {
                return NotificationProvider.validateCreateNotificationObject(notification_object);
            } catch(error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occured:');
            }
        });

        it('should not allow object without a body', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.body;

            try {
                return NotificationProvider.validateCreateNotificationObject(notification_object);
            } catch(error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occured:');
            }
        });

        it('should not allow object without a body', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.category;

            try {
                return NotificationProvider.validateCreateNotificationObject(notification_object);
            } catch(error) {
                // then
                return expect(error.message).to.have.string('[500] One or more validation errors occured:');
            }
        });

        it('should allow valid object', () => {
            return NotificationProvider.validateCreateNotificationObject(valid_object).then((result) => {
                expect(result).to.be.defined;
            });
        });

    });

    describe('createNotificationsForAccount', () => {
        let valid_object = {
            account: '*',
            type: 'any',
            category: 'any',
            action: 'any',
            title: 'any',
            body: 'any'
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
                return expect(error.message).to.have.string('[500] One or more validation errors occured:');
            }
        });

        xit('should create notifications when the object is valid', (done) => {
            // given
            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
                create: (notification_object) => {
                    expect(notification_object).to.be.defined;
                    expect(notification_object.user).to.equal('user@example.com');
                    done();
                }
            });
            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/UserACL.js'), {
                queryBySecondaryIndex: () => {
                    return Promise.resolve([{
                        user: 'user@example.com'
                    }]);
                }
            });
            let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

            NotificationProvider.createNotificationsForAccount(valid_object).catch((error) => {
                done(error);
            });
        });

    });

    describe('createNotificationForAccountAndUser', () => {
        let valid_object = {
            account: '*',
            user: 'user@example.com',
            type: 'any',
            category: 'any',
            action: 'any',
            title: 'any',
            body: 'any'
        };

        xit('should not create notifications when the user is not defined', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
                create: (notification_object) => {
                    expect(notification_object).not.to.equal(notification_object, '[500] Notification utilities should not have been called.');
                }
            });

            // when
            delete notification_object.user;

            return NotificationProvider.createNotificationForAccountAndUser(notification_object).catch((error) => {
                // then
                return expect(error.message).to.equal('[500] User is mandatory.');
            });
        });

        xit('should create notification when the object is valid', (done) => {
            // given
            mockery.registerMock(global.SixCRM.routes.path('controllers', 'entities/Notification.js'), {
                create: (notification_object) => {
                    expect(notification_object).to.be.defined;
                    expect(notification_object.id).to.be.defined;
                    expect(notification_object.user).to.equal(valid_object.user);
                    expect(notification_object.account).to.equal(valid_object.account);
                    expect(notification_object.type).to.equal(valid_object.type);
                    expect(notification_object.category).to.equal(valid_object.category);
                    expect(notification_object.action).to.equal(valid_object.action);
                    expect(notification_object.body).to.equal(valid_object.body);
                    done();
                }
            });
            let NotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/notification-provider.js');

            NotificationProvider.createNotificationForAccountAndUser(valid_object);
        });

    });

});
