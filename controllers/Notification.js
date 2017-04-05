'use strict';
const du = require('../lib/debug-utilities.js');
const entityController = require('./Entity.js');
const accountController = require('./Account.js');

class notificationController extends entityController {

	constructor() {
		super(process.env.notifications_table, 'notification');
		this.table_name = process.env.notifications_table;
		this.descriptive_name = 'notification';
	}

    /**
	 * Get the notifications for current account and update the last seen time.
	 *
     * @returns {Promise}
     */
    listForCurrentAccount(cursor, limit) {
		du.debug(`Listing notifications by secondary index for account '${global.account}'.`);

		let notifications = this.listBySecondaryIndex('account', global.account, 'account-index', cursor, limit)
			.then(result => {
				return { notifications: result }
            });

		let updateCurrentAccountSeenTime = accountController.get(global.account).then(account => {
			account.lastReadNotificationsAt = Date.now();
			return account;
		}).then(account => accountController.update(account));

		return Promise.all([notifications, updateCurrentAccountSeenTime]).then(() => notifications);
	}
}

module.exports = new notificationController();