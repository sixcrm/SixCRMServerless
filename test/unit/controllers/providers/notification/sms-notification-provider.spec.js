let SmsNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/sms-notification-provider.js');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('controllers/providers/notification/sms-notification-provider', () => {

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
        type: 'notification',
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
                return SmsNotificationProvider.sendNotificationViaSms(notification_object, sms_number);
            } catch(error) {
                // then
                expect(error).not.to.be.null;
                return expect(error.message).to.have.string('[500] One or more validation errors occurred:');
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

            let SmsNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/sms-notification-provider.js');

            SmsNotificationProvider.sendNotificationViaSms(valid_notification_object, sms_number)
                .catch((error) => {
                    done(error.message);
                });
        });

    });

    describe('getInternationalPhoneNumber', () => {

        it('returns international phone number', () => {

            let sms_number = '+381630000000'; //any number starting with +

            let SmsNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/sms-notification-provider.js');

            expect(SmsNotificationProvider.getInternationalPhoneNumber(sms_number)).to.equal(sms_number);
        });

        it('appends "+1" to international phone number', () => {

            let sms_number = '0630000000'; //any number not starting with "+"

            let SmsNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/sms-notification-provider.js');

            expect(SmsNotificationProvider.getInternationalPhoneNumber(sms_number)).to.equal('+1' + sms_number);
        })
    });

    describe('formatSmsBody', () => {

        it('returns abbreviated sms body if it\'s longer than limit', () => {

            let notification_object = valid_notification_object;

            //any text longer than limit (140)
            notification_object.title = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mauris " +
                "elit, varius quis vestibulum nec, pretium in felis. In eget mollis tellus.";

            let SmsNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/sms-notification-provider.js');

            expect(SmsNotificationProvider.formatSmsBody(notification_object))
                .to.equal('SixCRM notification: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean' +
                ' mauris elit, varius quis vestibulum nec, pretium in...');
        });
    });
});
