'use strict'

require('../../SixCRM.js');

const NotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/Notification.js');
const PermissionUtilities = global.SixCRM.routes.include('lib','permission-utilities.js');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

PermissionUtilities.disableACLs();

/*
 * Parameters: body account user
 *
 * Examples:
 * Create a notification with a given body for a specific user of an account and phone number and send it via all channels:
 * stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/notifications/generateallnotifications.js 'hi' '*' 'ljubomir@toptal.com'
 *
 * Make sure the user_setting is filled for specific user in the seed, as the underlying code respects the settings.
 *
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

if (!user) {
    du.output('User is required');
    printHelp();
    return;
}

let notification_object = {
    account: account,
    user: user,
    type: 'notification',
    category: 'message',
    action: 'test',
    title: 'testing notification',
    body: body
};

NotificationProvider.createNotificationForAccountAndUser(notification_object).then(() => {
    du.output('Attempted to insert and send a notification', notification_object);
    return true;
}).catch((error) => {
    du.error('Error while inserting or sending.', error);
});


function printHelp() {
    du.output('Helper for inserting notification for the given account and user. Notifications are sent via all channels.');
    du.output('Parameters: body account user');
}
