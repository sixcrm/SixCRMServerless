'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const timestamp = global.routes.include('lib', 'timestamp');
const entityController = global.routes.include('controllers', 'entities/Entity.js');

class notificationReadController extends entityController {

    constructor() {
        super(process.env.notifications_read_table, 'notification_read');
        this.table_name = process.env.notifications_read_table;
        this.descriptive_name = 'notification_read';
    }

     /**
     * Save the time the current user has seen the notifications for the current account.
     */
    markNotificationsAsSeen() {

        du.debug('Mark notifications as seen.');

        let key = {
            user: global.user.id,
            account: global.account
        };

        return this.touch(key);

    }

    /**
     * Get the last time the current user has seen notifications for the current account. If there is no entry in the
     * database - create one.
     */
    getLastSeenTime() {
        let key = {
            user: global.user.id,
            account: global.account
        };

        return this.getByKey(key).then((data) => {
            if (!data) {
                return this.markNotificationsAsSeen().then(() => timestamp.getISO8601());
            } else {
                return data.updated_at;
            }
        });
    }
}

module.exports = new notificationReadController();
