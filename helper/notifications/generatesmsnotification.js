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

const SmsNotificationUtilities = require('../../lib/sms-notification-utilities');
const PermissionUtilities = require('../../lib/permission-utilities');
const du = require('../../lib/debug-utilities.js');
const timestamp = require('../../lib/timestamp.js');

PermissionUtilities.disableACLs();

/*
 * Parameters: message account user phone_number
 *
 * Examples:
 * Create a notification with a given message for a specific user of an account and phone number and send it via SMS:
 * stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/notifications/generatesmsnotification.js 'hi' '*' 'ljubomir@toptal.com' '+381631025339'
 *
*/

let message = process.argv[2];
let account = process.argv[3];
let user = process.argv[4];
let phone_number = process.argv[5];

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

if (!phone_number) {
    du.output('Phone number is required');
    printHelp();
    return;
}

let notification_object = {
    id: '78b8306d-1c4a-41ef-bf71-7a4218e4d339',
    account: account,
    user: user,
    type: 'dummy',
    action: 'test',
    message: message,
    created_at: timestamp.getISO8601(),
    updated_at: timestamp.getISO8601()
};

SmsNotificationUtilities.sendNotificationViaSms(notification_object, phone_number);

du.output('Attempted to send a notification', notification_object);

function printHelp() {
    du.output('Helper for inserting notification for the given account and user. Notification is sent via SMS.');
    du.output('Parameters: message account user phone_number');
}