'use strict';
const _ = require('underscore');

const du = require('../lib/debug-utilities.js');
const dynamoutilities = require('../lib/dynamodb-utilities.js');

const notificationReadController = require('./NotificationRead');
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
		du.debug(`Listing notifications by secondary index for user '${global.user.id}'.`);

        notificationReadController.markNotificationsAsSeen(); // Update the time the user has listed notifications.

		return this.queryBySecondaryIndex('user', global.user.id, 'user-index', cursor, limit)
			.then(result => {
				return { notifications: result }
            });
	}

    /**
     * Get the number of unseen notifications for current user.
     *
     * @param cursor
     * @param limit
     */
    numberOfUnseenNotifications(cursor, limit) {
        let field = 'user';
        let index_name = 'user-index';
        du.debug('Counting number of unseen messages.');

        return notificationReadController.getLastSeenTime().then((last_seen_time) => {
            du.debug('Since ' + last_seen_time);

            // Technical Debt: This should be a method of Entity.js.
            return new Promise((resolve, reject) => {

                return this.can('read').then((permission) => {

                    if(permission !== true){

                        return resolve(null);

                    }

                    let query_parameters = {
                        condition_expression: '#'+field+' = :index_valuev',
                        expression_attribute_values: {':index_valuev': global.user.id, ':createdv': last_seen_time},
                        expression_attribute_names: {},
                        filter_expression: 'created_at > :createdv'
                    };

                    query_parameters.expression_attribute_names['#'+field] = field;

                    if(typeof cursor  !== 'undefined') {
                        query_parameters.ExclusiveStartKey = cursor;
                    }

                    if(typeof limit  !== 'undefined'){
                        query_parameters['limit'] = limit;
                    }

                    if(global.disableaccountfilter !== true){

                        if(_.has(global, 'account') && !_.contains(this.nonaccounts, this.descriptive_name)){

                            if(global.account == '*'){

                                //for now, do nothing

                            }else{

                                query_parameters.filter_expression += ' AND account = :accountv';
                                query_parameters.expression_attribute_values[':accountv'] = global.account;

                            }

                        }

                    }else{

                        du.warning('Global Account Filter Disabled');

                    }

                    du.debug(query_parameters);

                    return Promise.resolve(dynamoutilities.countRecords(this.table_name, query_parameters, index_name, (error, data) => {

                        if(_.isError(error)){

                            return reject(error);

                        }

                        return resolve({ count: data});

                    }));

                });

            });
        });
    }
}

module.exports = new notificationController();