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

    numberOfUnseenNotifications() {

      du.debug('Number of Unseen Notifications');

      let field = 'user';
      let index_name = 'user-index';

      return this.executeAssociatedEntityFunction('notificationReadController', 'getLastSeenTime', {})
      .then(last_seen_time => {

        return {
            key_condition_expression: '#user = :index_valuev',
            expression_attribute_values: {':index_valuev': global.user.id, ':createdv': last_seen_time}, //Technical Debt:  should not acquire global user like this...
            expression_attribute_names: {'#user': 'user'},
            filter_expression: 'created_at > :createdv',
            select: 'COUNT'
        };

      })
      .then(query_parameters => this.queryByParameters({parameters: query_parameters, index: 'user-index'}))
      .then(data => {

        if(objectutilities.has(data, 'Count', true)){

          return {count: parseInt(data.Count)};

        }

        eu.throwError('server', 'Response data is missing the "Count" field.');

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

    listByUser({query_parameters, user, pagination, reverse_order, fatal}) {

        return this.executeAssociatedEntityFunction('notificationReadController', 'markNotificationsAsSeen', {})
            .then(() => super.listByUser({query_parameters, user, pagination, reverse_order, fatal}))

    }

    listByType({type, pagination, user, fatal}){

      du.debug('List By Type');

      let query_parameters = {
        filter_expression: '#type = :typev',
        expression_attribute_names: {
          '#type': 'type'
        },
        expression_attribute_values: {
          ':typev': type
        }
      };

      if(!_.isUndefined(user) && user == true){
        query_parameters.filter_expression += ' AND #user = :userv';
        query_parameters.expression_attribute_names['#user'] = 'user';
        query_parameters.expression_attribute_values[':userv'] = this.getID(global.user)
      }

      return this.listByAccount({query_parameters: query_parameters, pagination: pagination, fatal: fatal});

    }

}

module.exports = new notificationController();
