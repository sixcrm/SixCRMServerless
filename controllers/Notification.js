'use strict';
const _ = require('underscore');

const du = require('../lib/debug-utilities.js');

const notificationReadController = require('./NotificationRead');
const entityController = require('./Entity.js');

class notificationController extends entityController {

    constructor() {
        super(process.env.notifications_table, 'notification');
        this.table_name = process.env.notifications_table;
        this.descriptive_name = 'notification';
    }

    /**
	 * Get the notifications for current user.
	 *
     * @returns {Promise}
     */
    listForCurrentUser(cursor, limit) {
        du.debug(`Listing notifications by secondary index for user '${global.user.id}'.`);

        notificationReadController.markNotificationsAsSeen(); // Update the time the user has listed notifications.

        return this.queryBySecondaryIndex('user', global.user.id, 'user-index', cursor, limit)
			.then(result => {
    return { notifications: result }
});
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
}

module.exports = new notificationController();