let EmailNotificationUtilities = global.SixCRM.routes.include('lib', 'email-notification-utilities.js');
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

    describe('sendNotificationViaEmail', () => {

        it('should not send a message when the object is not valid', () => {
            // given
            let notification_object = Object.assign({}, valid_notification_object);
            let email_address = 'user@test.com';

            mockery.registerMock(global.SixCRM.routes.path('lib', 'ses-utilities'), {
                sendEmail: (message) => {
                    expect(message).not.to.equal(message, 'SES utilities should not have been called.');
                }
            });

            // when
            delete notification_object.id;
            delete notification_object.user;

            try {
                return EmailNotificationUtilities.sendNotificationViaEmail(notification_object, email_address);
            } catch (error) {
                // then
                expect(error).not.to.be.null;
                return expect(error.message).to.equal('[500] One or more validation errors occurred.');
            }
        });

        xit('should attempt to send a message when the object is valid', (done) => {
            // given
            let email_address = 'user@test.com';
            let recepient_name = 'Big Feller'

            //Technical Debt:  This should probably mock the SystemMailer
            mockery.registerMock(global.SixCRM.routes.path('lib', 'smtp-utilities.js'), {
                send: (message) => {
                  expect(message).to.be.defined;
                  done();
                }
            });

            let EmailNotificationUtilities = global.SixCRM.routes.include('lib', 'email-notification-utilities.js');

            EmailNotificationUtilities.sendNotificationViaEmail(valid_notification_object, email_address, recepient_name)
                .catch((error) => {
                    console.log(error.message);
                    done(error.message);
                });
        });

    });



});
