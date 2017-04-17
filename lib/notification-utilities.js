'use strict';
const _ = require('underscore');

const du = require('./debug-utilities');
const permissionUtils = require('../lib/permission-utilities');

const notificationController = require('../controllers/Notification');
const userAclController = require('../controllers/UserACL');

/*
*  Technical Debt:
*    - Scripts which instantiate this utility have to make 2 function calls.  There should be a single function call that creates a notification object and issues the notification.
*    - Function calls (see createNotificationObject) should use a "parameters" JSON object, not individual arguments.  
*    - Function calls that use JSON parameter objects should be validated using a schema validator
*    - Eliminate ternary operators (Best Practices)
*    - Simplify code!  (See:  `return userAcls ? userAcls.map(acl => acl.user) : [];`)
*    - Note: the includes for scripts should be ordered as NPM installed packages, library files, controller files
*/

class NotificationUtilities {

    /**
	 * Create a notification for each user of the account.
	 *
     * @param notification_object
     * @returns {Promise}
     */
	createNotificationsForAccount(notification_object) {
		
		du.debug('Create Notifications For Account');
		
		du.debug(`Create notifications for users of account '${notification_object.account}'.`);

		return this.validateNotificationObject(notification_object).then((validation_result) => {
			if (!validation_result.valid) {
				throw new Error(validation_result.errors);
			} else {
                return this.getAccountUsers(notification_object.account);
            }
		}).then((users) => {
			if (users.length < 1) {
                return false;
			}

			let saveOperations = [];
			users.forEach(user => {
			
				let saveOperation = notificationController.create({
                    "user": user,
                    "account": notification_object.account,
                    "type": notification_object.type,
                    "action": notification_object.action,
                    "message": notification_object.message,
                    "created": Date.now()
				});

				saveOperations.push(saveOperation);
				du.debug(`Adding notification for user '${user}'.`);
				
			});
			
			return Promise.all(saveOperations).then((saveOperations) => {
				
				du.highlight('Notifications Created.');
				return saveOperations;
				
			});
			
		});
		
	}

    /**
	 * Crate notification for a specific user of the account.
	 *
     * @param notification_object
     * @returns {Promise}
     */
    createNotificationForAccountAndUser(notification_object) {
		
		du.debug('Create Notifications For Account and User');
		
        return this.validateNotificationObject(notification_object, true).then((validation_result) => {
            
            if (!validation_result.valid) {
            
                throw new Error(validation_result.errors);
                
            } else {
            
        		du.debug(`Create notification for account '${notification_object.account}' and user '${notification_object.user}'.`);
                return notificationController.create({
                    "user": notification_object.user,
                    "account": notification_object.account,
                    "type": notification_object.type,
                    "action": notification_object.action,
                    "message": notification_object.message,
                    "created": Date.now()
                }).then((response_object) => {
                	du.highlight('Notification created.');    	
                	return response_object;
                });
                
			}
			
        });
        
    }

    /**
	 * Create a notification object with given parameters.
	 *
     * @param account
     * @param type
     * @param action
     * @param message
     * @returns {Promise}
     */
    createNotificationObject(account, type, action, message) {
    	
    	du.debug('Create Notification Object');
    	
    	let result = {
    		account: account,
            type: type,
            action: action,
            message: message
    	};

    	return this.validateNotificationObject(result).then((validation) => {
    		if (validation.valid) {
    			return Promise.resolve(result);
			} else {
    			throw new Error(validation.errors);
			}
		});
		
	}

    /**
	 * Determine whether the given object can be used for creating a valid notification.
	 *
     * @param notification_object
	 * @param userRequired Whether to require 'user' field in the notification object
     * @returns {Promise.<boolean>}
     */
	validateNotificationObject(notification_object, userRequired) {
	
		du.debug('Validate Notification Object'); 
		
		du.debug(notification_object);

		let validation_errors = [];
        let mandatoryFields = ['account', 'type', 'action', 'message'];

        if (userRequired) {
        	mandatoryFields.push('user');
		}

        mandatoryFields.forEach(field => {
			if (!_.has(notification_object, field) || !_.isString(notification_object[field])) {
				let message = `${field} is mandatory.`;
				validation_errors.push(message);
				du.debug(message);
            }
		});


		if (validation_errors.length > 0) {
			return Promise.resolve({valid: false, errors: validation_errors});
		} else {
			return Promise.resolve({valid: true});
		}
		
	}

    /**
	 * All users that have access to given account.
	 *
     * @param account
     * @returns {Promise.<Array>}
     */
	getAccountUsers(account) {
		
		du.debug('getAccountUsers');
		// figure out if ACL checks were enabled
		let aclsWereEnabled = !permissionUtils.areACLsDisabled();
		permissionUtils.disableACLs();

		return userAclController.queryBySecondaryIndex('account', account, 'account-index').then((userAcls) => {
        	// re-enable ACLs only if there were enabled before this method
			if (aclsWereEnabled) {
				permissionUtils.enableACLs();
            }
			return userAcls ? userAcls.map(acl => acl.user) : [];
		}).catch(() => {
            // re-enable ACLs only if there were enabled before this method
            if (aclsWereEnabled) {
                permissionUtils.enableACLs();
            }
		});
	}
}

module.exports = new NotificationUtilities();