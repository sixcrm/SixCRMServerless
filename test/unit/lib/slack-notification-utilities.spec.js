let SlackNotificationUtilities = global.SixCRM.routes.include('lib', 'slack-notification-utilities.js');
let chai = require('chai');
let expect = chai.expect;
const mockery = require('mockery');

describe('lib/slack-notification-utilities', () => {

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
                return SlackNotificationUtilities.sendNotificationViaSlack(notification_object, webhook);
            } catch(error) {
                // then
                expect(error).not.to.be.null;
                return expect(error.message).to.equal('[500] One or more validation errors occurred.');
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
            let SlackNotificationUtilities = global.SixCRM.routes.include('lib', 'slack-notification-utilities.js');

            SlackNotificationUtilities.sendNotificationViaSlack(valid_notification_object, webhook)
                .catch((error) => {
                    console.log(error.message);
                    done(error.message);
                });
        });

    });



});
