'use strict'
const fs = require('fs');
const yaml = require('js-yaml');

require('../../SixCRM.js');

const site_config = yaml.safeLoad(fs.readFileSync(__dirname+`/../../config/${process.env.stage}/site.yml`, 'utf8'));

process.env.users_table = site_config.dynamodb.users_table;
process.env.user_acls_table = site_config.dynamodb.user_acls_table;
process.env.user_settings_table = site_config.dynamodb.user_settings_table;
process.env.notifications_table = site_config.dynamodb.notifications_table;
process.env.notification_settings_table = site_config.dynamodb.notification_settings_table;
process.env.notifications_read_table = site_config.dynamodb.notifications_read_table;
process.env.dynamo_endpoint = site_config.dynamodb.endpoint;
process.env.search_indexing_queue = 'search_indexing'

if (process.env.stage === 'local') {
    process.env.users_table = 'local' + process.env.users_table;
    process.env.user_settings_table = 'local' + process.env.user_settings_table;
    process.env.user_acls_table = 'local' + process.env.user_acls_table;
    process.env.notifications_table = 'local' + process.env.notifications_table;
    process.env.notifications_read_table = 'local' + process.env.notifications_read_table;
    process.env.notification_settings_table = 'local' + process.env.notification_settings_table;
}

const NotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/notification-provider.js');
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
    type: 'dummy',
    action: 'test',
    title: 'testing notification',
    body: body
};

NotificationProvider.createNotificationForAccountAndUser(notification_object).then(() => {
    du.output('Attempted to insert and send a notification', notification_object);
}).catch((error) => {
    du.error('Error while inserting or sending.', error);
});


function printHelp() {
    du.output('Helper for inserting notification for the given account and user. Notifications are sent via all channels.');
    du.output('Parameters: body account user');
}
