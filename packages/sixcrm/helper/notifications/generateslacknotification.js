require('@6crm/sixcrmcore');

const SlackNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/channels/slack.js');
const PermissionUtilities = require('@6crm/sixcrmcore/util/permission-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

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
	du.info('Body is required');
	printHelp();
}

if (!account) {
	du.info('Account is required');
	printHelp();
}

if (!user) {
	du.info('User is required');
	printHelp();
}

if (!webhook) {
	du.info('Webhook is required');
	printHelp();
}

let notification_object = {
	id: '78b8306d-1c4a-41ef-bf71-7a4218e4d339',
	account: account,
	user: user,
	type: 'notification',
	category: 'message',
	action: 'test',
	title: 'testing notification',
	body: body,
	created_at: timestamp.getISO8601(),
	updated_at: timestamp.getISO8601()
};

SlackNotificationProvider.sendNotificationViaSlack(notification_object, webhook);

du.info('Attempted to send a notification', notification_object);

function printHelp() {
	du.info('Helper for inserting notification for the given account and user. Notification is sent via Slack Webhook.');
	du.info('Parameters: body account user webhook');
}
