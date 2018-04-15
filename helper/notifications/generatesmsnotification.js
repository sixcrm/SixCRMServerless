require('../../SixCRM.js');

const SmsNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/channels/sms.js');
const PermissionUtilities = global.SixCRM.routes.include('lib','permission-utilities');
const du = global.SixCRM.routes.include('lib','debug-utilities.js');
const timestamp = global.SixCRM.routes.include('lib','timestamp.js');

PermissionUtilities.disableACLs();

/*
 * Parameters: body account user phone_number
 *
 * Examples:
 * Create a notification with a given body for a specific user of an account and phone number and send it via SMS:
 * stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/notifications/generatesmsnotification.js 'hi' '*' 'ljubomir@toptal.com' '+381631025339'
 *
*/

let body = process.argv[2];
let account = process.argv[3];
let user = process.argv[4];
let phone_number = process.argv[5];

if (!body) {
	du.output('Body is required');
	printHelp();
}

if (!account) {
	du.output('Account is required');
	printHelp();
}

if (!user) {
	du.output('User is required');
	printHelp();
}

if (!phone_number) {
	du.output('Phone number is required');
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

SmsNotificationProvider.sendNotificationViaSms(notification_object, phone_number);

du.output('Attempted to send a notification', notification_object);

function printHelp() {
	du.output('Helper for inserting notification for the given account and user. Notification is sent via SMS.');
	du.output('Parameters: body account user phone_number');
}
