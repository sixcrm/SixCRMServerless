let SlackNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/slack-notification-provider');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('controllers/providers/notification/slack-notification-provider', () => {

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

    describe('sendNotificationViaSlack', () => {

        it('should not send a message when the object is not valid', () => {
            // given
            let notification_object = Object.assign({}, valid_notification_object);
            let webhook = 'http://test.com/webhook';

            mockery.registerMock(global.SixCRM.routes.path('lib', 'slack-utilities'), {
                sendMessageToWebhook: (message) => {
                    expect(message).not.to.equal(message, 'Slack utilities should not have been called.');
                }
            });

            // when
            delete notification_object.id;
            delete notification_object.user;

            try {
                return SlackNotificationProvider.sendNotificationViaSlack(notification_object, webhook);
            } catch(error) {
                // then
                expect(error).not.to.be.null;
                return expect(error.message).to.have.string('[500] One or more validation errors occurred:');
            }
        });

        it('should attempt to send a message when the object is valid', (done) => {
            // given
            let webhook = 'http://test.com/webhook';

            mockery.registerMock(global.SixCRM.routes.path('lib', 'slack-utilities'), {
                sendMessageToWebhook: (message) => {
                    expect(message).to.be.defined;
                    done();
                }
            });
            let SlackNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/slack-notification-provider');

            SlackNotificationProvider.sendNotificationViaSlack(valid_notification_object, webhook)
            .catch((error) => {
                done(error.message);
            });
        });

    });

    describe('formatMessage', () => {

        it('returns abbreviated sms body if it\'s longer than limit', () => {

            let notification_object = valid_notification_object;

            notification_object.title = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mauris " +
                "elit, varius quis vestibulum nec, pretium in felis. In eget mollis tellus.";

            let SlackNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/slack-notification-provider');

            expect(SlackNotificationProvider.formatMessage(notification_object))
                .to.equal('SixCRM notification: "' + notification_object.title + '".');
        });
    });

});
