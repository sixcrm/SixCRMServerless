'use strict'
const fs = require('fs');
const yaml = require('js-yaml');

require('../../SixCRM.js');

const EmailNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/email-notification-provider');
const PermissionUtilities = global.SixCRM.routes.include('lib','permission-utilities');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');

PermissionUtilities.disableACLs();

/*
 * Parameters: body account user
 *
 * Examples:
 * Create a notification with a given body for a specific user of an account:
 * stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/notifications/generateemailnotification.js 'hi' '*' 'ljubomir@toptal.com'
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
    id: '78b8306d-1c4a-41ef-bf71-7a4218e4d339',
    account: account,
    user: user,
    type: 'dummy',
    action: 'test',
    title: 'testing notification',
    body: body,
    created_at: timestamp.getISO8601(),
    updated_at: timestamp.getISO8601()
};

EmailNotificationProvider.sendNotificationViaEmail(notification_object, user);

du.output('Attempted to send a notification via email.', notification_object);

function printHelp() {
    du.output('Helper for inserting notification for the given account and user. User is optional.');
    du.output('Parameters: body account [user]');
}
