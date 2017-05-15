const fs = require('fs');
const yaml = require('js-yaml');
const site_config = yaml.safeLoad(fs.readFileSync(__dirname+`/../../config/${process.env.stage}/site.yml`, 'utf8'));

process.env.users_table = site_config.dynamodb.users_table;
process.env.user_acls_table = site_config.dynamodb.user_acls_table;
process.env.notifications_table = site_config.dynamodb.notifications_table;
process.env.notification_settings_table = site_config.dynamodb.notification_settings_table;
process.env.notifications_read_table = site_config.dynamodb.notifications_read_table;
process.env.dynamo_endpoint = site_config.dynamodb.endpoint;
process.env.search_indexing_queue_url = site_config.sqs.search_indexing_queue_url;

if (process.env.stage === 'local') {
    process.env.users_table = 'local' + process.env.users_table;
    process.env.user_acls_table = 'local' + process.env.user_acls_table;
    process.env.notifications_table = 'local' + process.env.notifications_table;
    process.env.notifications_read_table = 'local' + process.env.notifications_read_table;
    process.env.notification_settings_table = 'local' + process.env.notification_settings_table;
}

const NotificationProvider = require('../../controllers/providers/notification/notification-provider.js');
const PermissionUtilities = require('../../lib/permission-utilities');
const du = require('../../lib/debug-utilities.js');

PermissionUtilities.disableACLs();

/*
 * Parameters: message account user
 *
 * Examples:
 * Create a notification with a given message for a specific user of an account and phone number and send it via all channels:
 * stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/notifications/generateallnotifications.js 'hi' '*' 'ljubomir@toptal.com'
 *
 * Make sure the user_setting is filled for specific user in the seed, as the underlying code respects the settings.
 *
*/

let message = process.argv[2];
let account = process.argv[3];
let user = process.argv[4];

if (!message) {
    du.output('Message is required');
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
    message: message
};

NotificationProvider.createNotificationForAccountAndUser(notification_object);

du.output('Attempted to insert and send a notification', notification_object);

function printHelp() {
    du.output('Helper for inserting notification for the given account and user. Notifications are sent via all channels.');
    du.output('Parameters: message account user');
}