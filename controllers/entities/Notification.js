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

      du.debug('List For Current User');

      return this.executeAssociatedEntityFunction('notificationReadController', 'markNotificationsAsSeen', {}).then(() => {

        let user_id = global.user.id;

        return this.queryBySecondaryIndex({field: 'user', index_value: user_id, index_name: 'user-index', pagination: pagination, reverse_order: true});

      })

    }

    /**
     * Get the number of unseen notifications for current user.
     */
    numberOfUnseenNotifications() {

      du.debug('Number of Unseen Notifications');

      let field = 'user';
      let index_name = 'user-index';

      du.debug('Counting number of unseen messages.');

      return this.executeAssociatedEntityFunction('notificationReadController', 'getLastSeenTime', {}).then((last_seen_time) => {

        du.debug('Since ' + last_seen_time);

        //Technical Debt:  This is a very specific function, should not be in entities.
        return this.countCreatedAfterBySecondaryIndex({date_time: last_seen_time, field: field, index_name: index_name});

      });

    }

    /**
     * Whether a given object is a valid notification.
     *
     * @param notification_object
     * @returns {Promise}
     */

    //Technical Debt:  Why is this necessarily a promise?
    isValidNotification(notification_object) {

      du.debug('Is Valid Notification');

      return Promise.resolve(mvu.validateModel(notification_object, global.SixCRM.routes.path('model', 'entities/notification.json')));

    }

}

module.exports = new notificationController();
