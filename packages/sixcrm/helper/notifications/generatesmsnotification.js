require('@6crm/sixcrmcore');

const SmsNotificationProvider = global.SixCRM.routes.include('controllers','providers/notification/channels/sms.js');
const PermissionUtilities = require('@6crm/sixcrmcore/util/permission-utilities').default;
const du = require('@6crm/sixcrmcore/util/debug-utilities').default;
const timestamp = require('@6crm/sixcrmcore/util/timestamp').default;

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

if (!phone_number) {
	du.info('Phone number is required');
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

du.info('Attempted to send a notification', notification_object);

function printHelp() {
	du.info('Helper for inserting notification for the given account and user. Notification is sent via SMS.');
	du.info('Parameters: body account user phone_number');
}
