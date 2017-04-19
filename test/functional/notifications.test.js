const expect = require('chai').expect;
const TestUtils = require('./test-utils');
let notificationController;

describe('notificationController', function () {
    before(() => {
        TestUtils.setGlobalUser();
        TestUtils.setEnvironmentVariables();
        // we need to initialize controller _after_ the variables has been set, that's why it's not on top of the file
        notificationController = require('../../controllers/Notification');
    });

    afterEach(() => {
        // Unconditional database cleanup.
        return notificationController.delete(aNotification.id);
    });

    it('should create a notification', function (done) {
        notificationController.get(aNotification.id).then((response) => {
            // given we don't have a notification with such id
            return expect(response).to.be.null;
        }).then(() => {
            // when we create a notification
            return notificationController.create(aNotification);
        }).then(() => {
            return notificationController.get(aNotification.id);
        }).then((notification) => {
            // we should be able to get it by id
            expect(notification).not.to.be.null;
            done();
        }).catch((error) => {
            done(error);
        });
    });

    it('should see count when new notification arrives', function (done) {
        notificationController.numberOfUnseenNotifications().then((response) => {
            // given we don't have a notifications
            return expect(response.count).to.equal(0);
        }).then(() => {
            // when we create a notification
            return notificationController.create(aNotification);
        }).then(() => {
            return notificationController.numberOfUnseenNotifications();
        }).then((response) => {
            // then we should see count of 1
            expect(response.count).to.equal(1);
            done();
        }).catch((error) => {
            done(error);
        });
    });

    it('count should reset when we see notifications', function (done) {
        notificationController.numberOfUnseenNotifications().then((response) => {
            // given we don't have a notifications
            return expect(response.count).to.equal(0);
        }).then(() => {
            // when we create a notification
            return notificationController.create(aNotification);
        }).then(() => {
            return notificationController.numberOfUnseenNotifications();
        }).then((response) => {
            // then we should see count of 1
            return expect(response.count).to.equal(1);
        }).then(() => {
            // when we see the notifications
            return notificationController.listForCurrentUser();
        }).then(() => {
            return notificationController.numberOfUnseenNotifications();
        }).then((response) => {
            // then we should see count of 0
            expect(response.count).to.equal(0);
            done();
        }).catch((error) => {
            done(error);
        });
    });


    let aNotification = {
        id: "8e4fdf13-e16a-4112-8238-1055e2439903",
        user: "admin.user@test.com",
        account: "d3fa3bf3-7824-49f4-8261-87674482bf1c",
        type: "payment",
        action: "succeeded",
        message: "a message"
    };

});

