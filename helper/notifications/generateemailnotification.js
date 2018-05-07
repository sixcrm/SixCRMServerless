require('../../SixCRM.js');

const EmailNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/channels/email.js');
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

EmailNotificationProvider.sendNotificationViaEmail(notification_object, user);

du.info('Attempted to send a notification via email.', notification_object);

function printHelp() {
	du.info('Helper for inserting notification for the given account and user. User is optional.');
	du.info('Parameters: body account [user]');
}
