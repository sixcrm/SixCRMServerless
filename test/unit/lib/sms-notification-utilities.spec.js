let SmsNotificationUtilities = global.SixCRM.routes.include('lib', 'sms-notification-utilities.js');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('lib/sms-notification-utilities', () => {

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

    let valid_notification_object = {
        id: 'aa26af35-5542-4c2b-9a75-45100e78fc97',
        account: '*',
        user: 'test@test.com',
        type: 'any',
        action: 'any',
        title: 'any',
        body: 'any',
        created_at: '2017-04-06T18:40:41.405Z',
        updated_at: '2017-04-06T18:40:41.405Z'
    };

    describe('sendNotificationViaSms', () => {

        it('should not send a message when the object is not valid', () => {
            // given
            let notification_object = Object.assign({}, valid_notification_object);
            let sms_number = '+381630000000';

            mockery.registerMock(global.SixCRM.routes.path('lib', 'sns-utilities'), {
                sendSMS: (message) => {
                    expect(message).not.to.equal(message, 'SNS utilities should not have been called.');
                }
            });

            // when
            delete notification_object.id;
            delete notification_object.user;

            try {
                return SmsNotificationUtilities.sendNotificationViaSms(notification_object, sms_number);
            } catch(error) {
                // then
                expect(error).not.to.be.null;
                return expect(error.message).to.equal('[500] One or more validation errors occurred.');
            }
        });

        it('should attempt to send a message when the object is valid', (done) => {
            // given
            let sms_number = '+381630000000';

            mockery.registerMock(global.SixCRM.routes.path('lib', 'sns-utilities'), {
                sendSMS: (message) => {
                    expect(message).to.be.defined;
                    done();
                }
            });

            let SmsNotificationUtilities = global.SixCRM.routes.include('lib', 'sms-notification-utilities.js');

            SmsNotificationUtilities.sendNotificationViaSms(valid_notification_object, sms_number)
                .catch((error) => {
                    console.log(error.message);
                    done(error.message);
                });
        });

    });



});
