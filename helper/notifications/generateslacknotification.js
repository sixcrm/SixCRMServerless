'use strict'
const fs = require('fs');
const yaml = require('js-yaml');

require('../../SixCRM.js');

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

const SlackNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/slack-notification-provider');
const PermissionUtilities = global.SixCRM.routes.include('lib','permission-utilities');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');

PermissionUtilities.disableACLs();

/*
 * Parameters: body account user webhook.
 *
 * Examples:
 * Create a notification with a given body for a specific user of an account and send it via slack webhook:
 * stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/notifications/generateslacknotification.js 'test' '*' 'ljubomir@toptal.com' 'https://hooks.slack.com/services/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'
 *
*/

let body = process.argv[2];
let account = process.argv[3];
let user = process.argv[4];
let webhook = process.argv[5];

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

if (!webhook) {
    du.output('Webhook is required');
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

SlackNotificationProvider.sendNotificationViaSlack(notification_object, webhook);

du.output('Attempted to send a notification', notification_object);

function printHelp() {
    du.output('Helper for inserting notification for the given account and user. Notification is sent via Slack Webhook.');
    du.output('Parameters: body account user webhook');
}
