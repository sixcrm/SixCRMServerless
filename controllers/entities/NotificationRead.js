'use strict';
const _ = require('underscore');

const du = global.routes.include('lib', 'debug-utilities.js');
const timestamp = global.routes.include('lib', 'timestamp');
const entityController = global.routes.include('controllers', 'entities/Entity.js');

class notificationReadController extends entityController {

    constructor() {
        super('notificationread');
    }

     /**
     * Save the time the current user has seen the notifications for the current account.
     */
    markNotificationsAsSeen() {

        du.debug('Mark notifications as seen.');

        let notificationread = {
            id: `${global.user.id}/${global.account}`
        };

        return this.touch(notificationread);

    }

    /**
     * Get the last time the current user has seen notifications for the current account. If there is no entry in the
     * database - create one.
     */
    getLastSeenTime() {
        let id = `${global.user.id}/${global.account}`;

        return this.get(id).then((data) => {
            if (!data) {
                return this.markNotificationsAsSeen().then(() => timestamp.getISO8601());
            } else {
                return data.updated_at;
            }
        });
    }
}

module.exports = new notificationReadController();
