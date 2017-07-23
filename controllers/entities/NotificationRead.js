'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib', 'timestamp');
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

class notificationReadController extends entityController {

    constructor() {
        super('notificationread');
    }

     /**
     * Save the time the current user has seen the notifications for the current account.
     */
    markNotificationsAsSeen() {
        return this.getOrCreateNotificationRead().then(notification_read => {
            this.touch(notification_read);
        });
    }

    /**
     * Get the last time the current user has seen notifications for the current account. If there is no entry in the
     * database - create one.
     */
    getLastSeenTime() {
        return this.getOrCreateNotificationRead().then(notification_read => {
            return notification_read.updated_at;
        });
    }

    getNotificationRead() {
        let user_id = global.user.id;
        let account_id = global.account;

        return this.queryBySecondaryIndex('user', user_id, 'user-index').then((response) => {
            if (!response) {
                return null;
            }

            let notification_reads = response.notificationreads;

            if (!notification_reads || notification_reads.length === 0) {
                return null;
            }

            let data_for_account = notification_reads.filter((notification_read) => notification_read.account === account_id);

            if (!data_for_account || data_for_account.length === 0) {
                return null;
            } else {
                return data_for_account[0];
            }
        });
    }

    getOrCreateNotificationRead() {
        let user_id = global.user.id;
        let account_id = global.account;

        return this.getNotificationRead().then(response => {
            if (!response) {
                return this.create({
                    user: user_id,
                    account: account_id
                });
            } else {
                return response;
            }
        });
    }
}

module.exports = new notificationReadController();
