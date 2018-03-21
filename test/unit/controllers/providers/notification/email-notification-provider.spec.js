let EmailNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/email-notification-provider.js');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

xdescribe('controllers/providers/notification/email-notification-provider', () => {

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
                return EmailNotificationProvider.sendNotificationViaEmail(notification_object, email_address);
            } catch (error) {
                // then
                expect(error).not.to.be.null;
                return expect(error.message).to.have.string('[500] One or more validation errors occurred:');
            }
        });

        it('should attempt to send a message when the object is valid', () => {
            // given
            let email_address = 'user@test.com';
            let recepient_name = 'Big Feller';

            mockery.registerMock(global.SixCRM.routes.path('helpers', 'email/SystemMailer.js'), {
                sendEmail: (email) => {
                    expect(email).to.be.defined;
                    expect(email.recepient_emails).to.deep.equal([email_address]);
                    expect(email.recepient_name).to.equal(recepient_name);
                    expect(email.subject).to.equal(valid_notification_object.title);
                    expect(email.body).to.contain(valid_notification_object.body);
                    return true;
                }
            });

            let EmailNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/email-notification-provider.js');

            return EmailNotificationProvider.sendNotificationViaEmail(valid_notification_object, email_address, recepient_name).then((result) => {
                expect(result).to.equal(true);
            });
        });

    });

    describe('formatEmailBody', () => {

        it('returns formatted email body', () => {

            let notification_object = valid_notification_object;

            notification_object.body = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mauris " +
                "elit, varius quis vestibulum nec, pretium in felis. In eget mollis tellus.";

            let EmailNotificationProvider = global.SixCRM.routes.include('controllers', 'providers/notification/email-notification-provider.js');

            expect(EmailNotificationProvider.formatEmailBody(notification_object))
                .to.equal('You received a notification with body "' + notification_object.body + '". Thanks for using SixCRM!');
        });
    });

});
