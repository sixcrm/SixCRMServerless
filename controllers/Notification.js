'use strict';
const du = require('../lib/debug-utilities.js');
const entityController = require('./Entity.js');
const dynamoutilities = require('../lib/dynamodb-utilities');
const _ = require('underscore');

// Technical Debt: figure out where to store this
const hardcoded_date = '2017-04-06T18:40:41.000Z'; // when the user has seen  notifications for the last time

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

		return this.queryBySecondaryIndex('user', global.user.id, 'user-index', cursor, limit)
			.then(result => {
				return { notifications: result }
            });
	}

    numberOfUnseenNotifications(cursor, limit) {
        let field = 'user';
        let index_name = 'user-index';
        du.debug('Counting number of unseen messages.');

        return new Promise((resolve, reject) => {

            return this.can('read').then((permission) => {

                if(permission !== true){

                    return resolve(null);

                }

                let query_parameters = {
                    condition_expression: '#'+field+' = :index_valuev',
                    expression_attribute_values: {':index_valuev': global.user.id, ':createdv': hardcoded_date},
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
    }
}

module.exports = new notificationController();