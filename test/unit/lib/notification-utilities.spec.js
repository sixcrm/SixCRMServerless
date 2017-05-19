let NotificationUtilities = global.routes.include('lib', 'notification-utilities.js');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('lib/notification-utilities', () => {

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
            action: 'any',
            title: 'any',
            message: 'any'
        };

        it('should not allow object without an account', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.account;

            return NotificationUtilities.validateCreateNotificationObject(notification_object).catch((error) => {
                // then
                return expect(error.message).to.equal('One or more validation errors occurred.');
            });
        });

        it('should not allow object without a type', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.type;

            return NotificationUtilities.validateCreateNotificationObject(notification_object).catch((error) => {
                // then
                return expect(error.message).to.equal('One or more validation errors occurred.');
            });
        });

        it('should not allow object without an action', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.action;

            return NotificationUtilities.validateCreateNotificationObject(notification_object).catch((error) => {
                // then
                return expect(error.message).to.equal('One or more validation errors occurred.');
            });
        });

        it('should not allow object without a message', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            // when
            delete notification_object.message;

            return NotificationUtilities.validateCreateNotificationObject(notification_object).catch((error) => {
                // then
                return expect(error.message).to.equal('One or more validation errors occurred.');
            });
        });

        it('should allow valid object', () => {
            return NotificationUtilities.validateCreateNotificationObject(valid_object).then((result) => {
                expect(result).to.be.defined;
            });
        });

    });

    describe('createNotificationsForAccount', () => {
        let valid_object = {
            account: '*',
            type: 'any',
            action: 'any',
            title: 'any',
            message: 'any'
        };

        it('should not create notifications when the account is not defined', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            mockery.registerMock(global.routes.path('controllers', 'entities/Notification.js'), {
                create: (notification_object) => {
                    expect(notification_object).not.to.equal(notification_object, 'Notification utilities should not have been called.');
                }
            });

            // when
            delete notification_object.account;

            return NotificationUtilities.createNotificationsForAccount(notification_object).catch((error) => {
                // then
                return expect(error.message).to.equal('One or more validation errors occurred.');
            });
        });

        it('should create notifications when the object is valid', (done) => {
            // given
            mockery.registerMock(global.routes.path('controllers', 'entities/Notification.js'), {
                create: (notification_object) => {
                    expect(notification_object).to.be.defined;
                    expect(notification_object.user).to.equal('user@example.com');
                    done();
                }
            });
            mockery.registerMock(global.routes.path('controllers', 'entities/UserACL.js'), {
                queryBySecondaryIndex: () => {
                    return Promise.resolve([{
                        user: 'user@example.com'
                    }]);
                }
            });
            let NotificationUtilities = global.routes.include('lib', 'notification-utilities.js');

            NotificationUtilities.createNotificationsForAccount(valid_object).catch((error) => {
                done(error);
            });
        });

    });

    describe('createNotificationForAccountAndUser', () => {
        let valid_object = {
            account: '*',
            user: 'user@example.com',
            type: 'any',
            action: 'any',
            title: 'any',
            message: 'any'
        };

        it('should not create notifications when the user is not defined', () => {
            // given
            let notification_object = Object.assign({}, valid_object);

            mockery.registerMock(global.routes.path('controllers', 'entities/Notification.js'), {
                create: (notification_object) => {
                    expect(notification_object).not.to.equal(notification_object, 'Notification utilities should not have been called.');
                }
            });

            // when
            delete notification_object.user;

            return NotificationUtilities.createNotificationForAccountAndUser(notification_object).catch((error) => {
                // then
                return expect(error.message).to.equal('User is mandatory.');
            });
        });

        it('should create notification when the object is valid', (done) => {
            // given
            mockery.registerMock(global.routes.path('controllers', 'entities/Notification.js'), {
                create: (notification_object) => {
                    expect(notification_object).to.be.defined;
                    expect(notification_object.id).to.be.defined;
                    expect(notification_object.user).to.equal(valid_object.user);
                    expect(notification_object.account).to.equal(valid_object.account);
                    expect(notification_object.type).to.equal(valid_object.type);
                    expect(notification_object.action).to.equal(valid_object.action);
                    expect(notification_object.message).to.equal(valid_object.message);
                    done();
                }
            });
            let NotificationUtilities = global.routes.include('lib', 'notification-utilities.js');

            NotificationUtilities.createNotificationForAccountAndUser(valid_object);
        });

    });

});
