global.disableactionchecks = true;

if (process.env.stage === 'local') {
    const TestUtilities = require('../test/functional/test-utils');
    TestUtilities.setEnvironmentVariables();
}
const NotificationUtilities = require('../lib/notification-utilities');
const du = require('../lib/debug-utilities.js');

// Parameters: message account [user]
//
// Examples:
// Create a notification with a given message for a specific user of an account:
// stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/generatenotification.js 'hi' '*' 'nikola.bosic@toptal.com'
//
// Create a notification with a given message for all users of an account:
// stage=local AWS_PROFILE=six SIX_VERBOSE=2 node helper/generatenotification.js 'hi' '*'

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

let notification_object = {
    account: account,
    type: 'dummy',
    action: 'test',
    message: message
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
    du.output('Parameters: message account [user]');
}