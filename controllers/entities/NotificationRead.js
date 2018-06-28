

const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const arrayutilities = require('@6crm/sixcrmcore/util/array-utilities').default;
const entityController = global.SixCRM.routes.include('controllers', 'entities/Entity.js');

module.exports = class NotificationReadController extends entityController {

	constructor() {
		super('notificationread');
	}

	/**
     * Save the time the current user has seen the notifications for the current account.
     */
	markNotificationsAsSeen() {

		du.debug('Mark Notifications As Seen');

		return this.getOrCreateNotificationRead().then(notification_read => {

			return this.touch({entity: notification_read});

		});

	}

	/**
     * Get the last time the current user has seen notifications for the current account. If there is no entry in the
     * database - create one.
     */
	getLastSeenTime() {

		du.debug('Get Last Seen Time');

		return this.getOrCreateNotificationRead().then(notification_read => {
			return notification_read.updated_at;
		});

	}

	getNotificationRead() {

		du.debug('Get Notification Read');

		//Technical Debt:  Use controller methods to acquire these...
		let user_id = global.user.id;
		let account_id = global.account;

		return this.queryBySecondaryIndex({field: 'user', index_value: user_id, index_name: 'user-index'}).then((response) => {
			if (!response) {
				return null;
			}

			let notification_reads = response.notificationreads;

			if (!notification_reads || notification_reads.length === 0) {
				return null;
			}

			let data_for_account = arrayutilities.filter(notification_reads, (notification_read) => {
				return (notification_read.account === account_id);
			});

			if (!data_for_account || data_for_account.length === 0) {
				return null;
			} else {
				return data_for_account[0];
			}
		});

	}

	buildNotificationReadObject(){

		du.debug('Build Notification Read Object')

		//Technical Debt:  Acquire these with controller methods
		return {
			user: global.user.id,
			account: global.account
		};

	}

	getOrCreateNotificationRead() {

		du.debug('Get Or Create Notification Read');

		return this.getNotificationRead().then(response => {

			if (!response) {

				let notificationReadObject = this.buildNotificationReadObject();

				return this.create({entity: notificationReadObject});

			} else {

				return response;

			}

		});

	}

}

