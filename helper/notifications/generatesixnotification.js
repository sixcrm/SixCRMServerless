'use strict'
const fs = require('fs');
const yaml = require('js-yaml');

require('../../routes.js');

const site_config = yaml.safeLoad(fs.readFileSync(__dirname+`/../../config/${process.env.stage}/site.yml`, 'utf8'));

process.env.users_table = site_config.dynamodb.users_table;
process.env.user_acls_table = site_config.dynamodb.user_acls_table;
process.env.notifications_table = site_config.dynamodb.notifications_table;
process.env.notification_settings_table = site_config.dynamodb.notification_settings_table;
process.env.notifications_read_table = site_config.dynamodb.notifications_read_table;
process.env.dynamo_endpoint = site_config.dynamodb.endpoint;
process.env.search_indexing_queue = 'search_indexing'

if (process.env.stage === 'local') {
    process.env.users_table = 'local' + process.env.users_table;
    process.env.user_acls_table = 'local' + process.env.user_acls_table;
    process.env.notifications_table = 'local' + process.env.notifications_table;
    process.env.notifications_read_table = 'local' + process.env.notifications_read_table;
    process.env.notification_settings_table = 'local' + process.env.notification_settings_table;
}

const NotificationUtilities = global.routes.include('lib','notification-utilities.js');
const PermissionUtilities = global.routes.include('lib','permission-utilities');
const du = global.routes.include('lib','debug-utilities.js');

PermissionUtilities.disableACLs();

/*
 * Parameters: body account [user]
 *
 * Examples:
 * Create a notification with a given body for a specific user of an account:
 * stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/generatenotification.js 'hi' '*' 'nikola.bosic@toptal.com'
 *
 * Create a notification with a given body for all users of an account:
 * stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/generatenotification.js 'hi' '*'
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
    type: 'dummy',
    action: 'test',
    title: 'testing notification',
    body: body
};

if (user) {
    notification_object['user'] = user;
    NotificationUtilities.createNotificationForAccountAndUser(notification_object);
} else {
    NotificationUtilities.createNotificationsForAccount(notification_object);
}

du.output('Attempted to insert a notification', notification_object);

function printHelp() {
    du.output('Helper for inserting notification for the given account and user. User is optional.');
    du.output('Parameters: body account [user]');
}
