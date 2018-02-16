'use strict'

require('../../SixCRM.js');

const NotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/notification-provider.js');
const PermissionUtilities = global.SixCRM.routes.include('lib','permission-utilities');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

PermissionUtilities.disableACLs();

/*
 * Parameters: body account [user]
 *
 * Examples:
 * Create a notification with a given body for a specific user of an account:
 * stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/notifications/generatesixnotification.js 'hi' '*' 'ljubomir@toptal.com'
 *
 * Create a notification with a given body for all users of an account:
 * stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/notifications/generatesixnotification.js 'hi' '*'
*/

let body = process.argv[2];
let account = process.argv[3];
let user = process.argv[4];

if (!body) {
    du.output('Body is required');
    printHelp();
    return;
}

if (!account) {
    du.output('Account is required');
    printHelp();
    return;
}

let notification_object = {
    account: account,
    type: 'notification',
    category: 'message',
    action: 'test',
    title: 'testing notification',
    body: body
};

if (user) {
    notification_object['user'] = user;
    NotificationProvider.createNotificationForAccountAndUser(notification_object);
} else {
    NotificationProvider.createNotificationsForAccount(notification_object);
}

du.output('Attempted to insert a notification', notification_object);

function printHelp() {
    du.output('Helper for inserting notification for the given account and user. User is optional.');
    du.output('Parameters: body account [user]');
}
