'use strict';
const _ = require('underscore');

const du = global.SixCRM.routes.include('lib', 'debug-utilities.js');
const eu = global.SixCRM.routes.include('lib', 'error-utilities.js');
const mvu = global.SixCRM.routes.include('lib', 'model-validator-utilities.js');
const objectutilities = global.SixCRM.routes.include('lib', 'object-utilities.js');

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

    numberOfUnseenNotifications() {

      du.debug('Number of Unseen Notifications');

      let field = 'user';
      let index_name = 'user-index';

      return this.executeAssociatedEntityFunction('notificationReadController', 'getLastSeenTime', {})
      .then(last_seen_time => {

        let query_parameters = {
            key_condition_expression: '#user = :index_valuev',
            expression_attribute_values: {':index_valuev': global.user.id, ':createdv': last_seen_time}, //Technical Debt:  should not acquire global user like this...
            expression_attribute_names: {'#user': 'user'},
            filter_expression: 'created_at > :createdv',
            select: 'COUNT'
        };

        return this.queryByParameters({parameters: query_parameters, index: 'user-index'});

      }).then(data => {

        du.warning(data);

        if(objectutilities.has(data, 'Count', true)){

          if(_.isNumber(data.Count)){ return data.Count; }

          eu.throwError('server', 'Not a number.');

        }

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
