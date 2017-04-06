'use strict';
const du = require('../lib/debug-utilities.js');
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
    	// Technical Debt: This should also update the last seen time, once we figure out where to store it.
		du.debug(`Listing notifications by secondary index for user '${global.user.id}'.`);

		return this.listBySecondaryIndex('user', global.user.id, 'user-index', cursor, limit)
			.then(result => {
				return { notifications: result }
            });
	}

    /**
     * Get the notifications for current user and account.
     *
     * @returns {Promise}
     */
    listForCurrentUserAndAccount(cursor, limit) {
        // Technical Debt: This should also update the last seen time, once we figure out where to store it.
        du.debug(`Listing notifications by secondary index for user '${global.user.id}' and account '${global.account}'.`);

        return this.listBySecondaryIndex('user', global.user.id, 'user-index', cursor, limit)
            .then(result => {
            	// Technical Debt: Should this be filtered in the database query instead of here? Is this even needed?
                return { notifications: result.filter((notification) => notification.account === global.account)}
            });
    }
}

module.exports = new notificationController();