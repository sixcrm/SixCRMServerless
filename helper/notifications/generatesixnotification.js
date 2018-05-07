require('../../SixCRM.js');

const NotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/Notification.js');
const notificationProvider = new NotificationProvider();
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
	du.info('Body is required');
	printHelp();
}

if (!account) {
	du.info('Account is required');
	printHelp();
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
	notificationProvider.createNotificationForAccountAndUser(notification_object);
} else {
	notificationProvider.createNotificationsForAccount(notification_object);
}

du.info('Attempted to insert a notification', notification_object);

function printHelp() {
	du.info('Helper for inserting notification for the given account and user. User is optional.');
	du.info('Parameters: body account [user]');
}
