'use strict'
require('../SixCRM.js');
const APNProvider = global.SixCRM.routes.include('lib','providers/apn-provider');
const apnprovider = new APNProvider();
const du = global.SixCRM.routes.include('lib','debug-utilities.js');

let message = process.argv[2];
let user = process.argv[3];

if (!message) {
    du.output('Message is required');
    process.exit();
}

if (!user) {
    du.output('User (email) is required');
    process.exit();
}

//Flesh out the user.  Make sure device tokens are set

return apnprovider.sendNotifications(user, message).then((result) => {
    du.output('Notification Result', result);
    return result;
})
.catch((error) => {
    du.warning('Error:', error);
});
