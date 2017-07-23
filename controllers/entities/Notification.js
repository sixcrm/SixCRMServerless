'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');

const notificationReadController = global.SixCRM.routes.include('controllers', 'entities/NotificationRead');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class notificationController extends entityController {

    constructor() {
        super('notification');
    }

    /**
	 * Get the notifications for current user.
	 *
     * @returns {Promise}
     */
    listForCurrentUser(pagination) {

        return notificationReadController.markNotificationsAsSeen().then(() => {

            return this.queryBySecondaryIndex('user', global.user.id, 'user-index', pagination, true);

        }); // Update the time the user has listed notifications.

    }

    /**
     * Get the number of unseen notifications for current user.
     */
    numberOfUnseenNotifications() {
        let field = 'user';
        let index_name = 'user-index';

        du.debug('Counting number of unseen messages.');

        return notificationReadController.getLastSeenTime().then((last_seen_time) => {
            du.debug('Since ' + last_seen_time);

            return this.countCreatedAfterBySecondaryIndex(last_seen_time, field, index_name);
        });
    }

    /**
     * Whether a given object is a valid notification.
     *
     * @param notification_object
     * @returns {Promise}
     */
    isValidNotification(notification_object) {

        return Promise.resolve(
            mvu.validateModel(notification_object, global.SixCRM.routes.path('model', 'entities/notification.json')));
    }
}

module.exports = new notificationController();
