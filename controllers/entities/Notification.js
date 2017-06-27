'use strict';
const _ = require('underscore');
const Validator = require('jsonschema').Validator;

const du = global.routes.include('lib', 'debug-utilities.js');
const eu = global.routes.include('lib', 'error-utilities.js');

const notificationReadController = global.routes.include('controllers', 'entities/NotificationRead');
const entityController = global.routes.include('controllers', 'entities/Entity.js');

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


    //Technical Debt:  Just use the native validation method in Entity.js

    /**
     * Whether a given object is a valid notification.
     *
     * @param notification_object
     * @returns {Promise}
     */
    isValidNotification(notification_object) {
        let schema;

        try {
            schema = global.routes.include('model','entities/notification.json');
        } catch(e){
            return Promise.reject(eu.getError('server','Unable to load validation schemas.'));
        }

        let validation;
        let params = JSON.parse(JSON.stringify(notification_object || {}));

        try{
            let v = new Validator();

            validation = v.validate(params, schema);
        }catch(e){
            return Promise.reject(eu.getError('server','Unable to instantiate validator.'));
        }

        if(validation['errors'].length > 0) {

            du.warning(validation['errors']);

            return Promise.reject(eu.getError(
            'validation',
            'One or more validation errors occurred.',
            {issues: validation.errors.map(e => e.message)}
          ));

        }

        return Promise.resolve(params);
    }
}

module.exports = new notificationController();
